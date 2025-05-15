export function getIDFromName(name: string): string {
  // remove all special characters only allow letters, numbers and '-'
  // limit to 16 characters
  return name
    .toLowerCase()
    .replace(' ', '-')
    .replace(/[^aA-zZ0-9-]/g, '')
    .slice(0, 16);
}
