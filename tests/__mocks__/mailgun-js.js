// __mocks__ IGNORES ALL NPM MODULES YOU ADD TO THE FOLDER AS INDIVIDUAL .js FILES
const mailgun = () => {
    return {
      messages() {
        return {
          send() {},
        }
      },
    }
  }
   
  module.exports = mailgun