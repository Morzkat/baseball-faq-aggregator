export function countAs(value: string): number {
  return [...value].reduce((count, character) => {
    return character.toLowerCase() === "a" ? count + 1 : count;
  }, 0);
}

export function hasExactlyThreeAs(name: string): boolean {
  return countAs(name) === 3;
}
