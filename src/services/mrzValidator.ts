// Deterministic ICAO Doc 9303 MRZ Checksum Validator & Parser
// Weights pattern: 7, 3, 1, 7, 3, 1, ...

export function getCharWeightValue(char: string): number {
  const c = char.toUpperCase();
  if (c >= '0' && c <= '9') {
    return c.charCodeAt(0) - 48;
  }
  if (c >= 'A' && c <= 'Z') {
    return c.charCodeAt(0) - 55; // A=10, B=11, ... Z=35
  }
  return 0; // '<' or any other filler is 0
}

export function calculateIcaoCheckDigit(text: string): number {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < text.length; i++) {
    const val = getCharWeightValue(text[i]);
    const weight = weights[i % 3];
    sum += val * weight;
  }
  return sum % 10;
}

export function verifyIcaoField(text: string, checkDigitChar: string): boolean {
  const expected = calculateIcaoCheckDigit(text);
  const actual = parseInt(checkDigitChar, 10);
  return expected === actual;
}

export interface ParsedMRZResult {
  rawLine1: string;
  rawLine2: string;
  documentType: string;
  issuingCountry: string;
  surname: string;
  givenNames: string;
  passportNumber: string;
  passportCheckDigit: string;
  passportCheckPassed: boolean;
  nationality: string;
  dateOfBirth: string; // YYMMDD
  dobFormatted: string; // DD/MM/YYYY
  dobCheckDigit: string;
  dobCheckPassed: boolean;
  gender: string;
  expiryDate: string; // YYMMDD
  expiryFormatted: string; // DD/MM/YYYY
  expiryCheckDigit: string;
  expiryCheckPassed: boolean;
  compositeCheckDigit: string;
  compositeCheckPassed: boolean;
  allChecksumsValid: boolean;
}

export function parseAndValidateTD3MRZ(line1: string, line2: string): ParsedMRZResult {
  // TD3 format is 2 lines of 44 characters
  const l1 = line1.padEnd(44, '<').substring(0, 44).toUpperCase();
  const l2 = line2.padEnd(44, '<').substring(0, 44).toUpperCase();

  const documentType = l1.substring(0, 2).replace(/</g, '');
  const issuingCountry = l1.substring(2, 5).replace(/</g, '');
  
  const namePart = l1.substring(5);
  const nameSplit = namePart.split('<<');
  const surname = (nameSplit[0] || '').replace(/</g, ' ').trim();
  const givenNames = (nameSplit[1] || '').replace(/</g, ' ').trim();

  // Line 2
  const passportNumber = l2.substring(0, 9).replace(/</g, '');
  const passportCheckDigit = l2.substring(9, 10);
  const passportCheckPassed = verifyIcaoField(l2.substring(0, 9), passportCheckDigit);

  const nationality = l2.substring(10, 13).replace(/</g, '');

  const dob = l2.substring(13, 19);
  const dobCheckDigit = l2.substring(19, 20);
  const dobCheckPassed = verifyIcaoField(dob, dobCheckDigit);

  const gender = l2.substring(20, 21);

  const expiry = l2.substring(21, 27);
  const expiryCheckDigit = l2.substring(27, 28);
  const expiryCheckPassed = verifyIcaoField(expiry, expiryCheckDigit);

  // Optional data field
  const optionalData = l2.substring(28, 42);
  const compositeCheckDigit = l2.substring(43, 44);

  // Composite check covers: passportNumber + checkDigit + dob + checkDigit + expiry + checkDigit + optionalData + optionalCheckDigit
  const compositePayload = l2.substring(0, 10) + l2.substring(13, 20) + l2.substring(21, 43);
  const compositeCheckPassed = verifyIcaoField(compositePayload, compositeCheckDigit);

  // Format dates: YYMMDD -> DD/MM/20YY (or 19YY)
  const formatIcaoDate = (yymmdd: string, isDob = false): string => {
    if (yymmdd.length !== 6) return yymmdd;
    const yy = parseInt(yymmdd.substring(0, 2), 10);
    const mm = yymmdd.substring(2, 4);
    const dd = yymmdd.substring(4, 6);
    const fullYear = isDob ? (yy > 30 ? 1900 + yy : 2000 + yy) : 2000 + yy;
    return `${dd}/${mm}/${fullYear}`;
  };

  const allChecksumsValid = passportCheckPassed && dobCheckPassed && expiryCheckPassed && compositeCheckPassed;

  return {
    rawLine1: l1,
    rawLine2: l2,
    documentType: documentType || 'P',
    issuingCountry: issuingCountry || 'IND',
    surname,
    givenNames,
    passportNumber,
    passportCheckDigit,
    passportCheckPassed,
    nationality,
    dateOfBirth: dob,
    dobFormatted: formatIcaoDate(dob, true),
    dobCheckDigit,
    dobCheckPassed,
    gender: gender === 'M' ? 'MALE' : gender === 'F' ? 'FEMALE' : 'UNSPECIFIED',
    expiryDate: expiry,
    expiryFormatted: formatIcaoDate(expiry, false),
    expiryCheckDigit,
    expiryCheckPassed,
    compositeCheckDigit,
    compositeCheckPassed,
    allChecksumsValid,
  };
}
