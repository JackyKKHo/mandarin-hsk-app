import { useSyncedWordSet } from './useSyncedWordSet'

export function useDismissed() {
  const { ids, add, remove, removeMany } = useSyncedWordSet({
    table: 'dismissed',
    localKey: 'hsk-dismissed-words',
  })

  return {
    dismissed: ids,
    dismiss: add,
    undismiss: remove,
    clearLevel: removeMany,
  }
}
