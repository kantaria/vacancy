function extractHighestSalary(input) {
  const matches = input.match(/\d[\d\s]*\d/g);
  if (!matches) {
    return null;
  }
  const numbers = matches.map(match => parseInt(match.replace(/\s/g, ''), 10));
  return numbers[numbers.length - 1];
}

module.exports = extractHighestSalary;
