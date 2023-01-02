export const useParams = <T>(eventName: string, targetKey: string, data?: T) => {
  return {
    eventName,
    targetKey,
    data
  }
}
