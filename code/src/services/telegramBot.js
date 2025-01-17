const awsSecretsRetriever = require('./awsSecretsRetriever')
const axios = require('axios')

async function send (content) {
  const tokenString = await awsSecretsRetriever.retrieve('telegramBot')
  const token = JSON.parse(tokenString).telegramBot
  const encodedContent = encodeURIComponent(content)
  await axios.post(`https://api.telegram.org/bot${token}/sendMessage?chat_id=-635590910&text=${encodedContent}`,
    {},
    { headers: { 'Content-Type': 'application/json' } }
  )
}

module.exports = {
  send: send
}