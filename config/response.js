// response.js

export const response = (data = {}, result) => {
  const { isSuccess, code, message } = data;

  return {
    isSuccess: isSuccess,
    code: code,
    message: message,
    result: result,
  };
};

export const errResponse = ({isSuccess, code, message}) => {
  return {
      isSuccess: isSuccess,
      code:code,
      message: message
  }
};