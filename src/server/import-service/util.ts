export const convertToLogCall = (call: any) => {
  const omitFields = ['id', 'createdDate', 'updatedDate', 'isDeleted', 'deletedDate']
  const newCall = { ...call }

  omitFields.forEach(f => delete newCall[f])
  return newCall
}