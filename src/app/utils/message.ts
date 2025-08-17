export const createMessage = (title: string, body: string, data = {}) => {
  return {
    title,
    body,
    data,
  };
};
