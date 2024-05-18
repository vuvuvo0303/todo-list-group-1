export function formatDateToString(date: Date): string {
  //date.getDate() or date.getMonth(), the result is an integer
  //use String constructor or method toString() to convert it 
  //from int => string to use padStart method(Only for string)
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear().toString();
  return `${day}/${month}/${year}`;
}
