export const SEARCH = "SEARCH";

export const searchChange = (string) => {
  return {
    type: SEARCH,
    payload: string
  }
}
