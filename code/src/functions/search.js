const yad2Caller = require('../services/yad2Caller')
const data = require('../data')
const filesManager = require('../services/filesManager')
const telegramSender = require('../services/telegramBot')

module.exports.search = async (event, context, callback) => {
  const promises = []

  const folderName = new Date().toLocaleString().replace(/:/g, '-').replace(/\//g, '-').replace(/,/g, '')
  const dir = `resultsHistory/${folderName}`

  for (const item of data.searchData) {
    promises.push(yad2Caller.search(item.city, item.neighborhood, item.name, item.rooms, dir))
    await new Promise(resolve => setTimeout(resolve,5000))
  }

  const oldresultsFileContext = await filesManager.read('currentResults.txt')
  const oldResults = oldresultsFileContext.split(',')

  const promisesResults = (await Promise.allSettled(promises)).filter(result => result.status === 'fulfilled').map(result => result.value);
  const arrayPromisesResults = [].concat.apply([], promisesResults)
  const currentResults = [...new Set(arrayPromisesResults)]

  const deltaBetweenOldToCurrentResults = currentResults
    .filter(x => !oldResults.includes(x))

  if (deltaBetweenOldToCurrentResults.length > 0) {
    const telegramMessagePrefix = '\nהיי! מצאתי את הדירות הבאות:'


    await telegramSender.send(telegramMessagePrefix + convertIdsToLinks(deltaBetweenOldToCurrentResults).join('\n'))
  } else {
    console.log('I didn\'t find anything new')
  }

  await filesManager.write([...new Set([...currentResults, ...oldResults])], 'currentResults.txt')
  await filesManager.write(deltaBetweenOldToCurrentResults, 'deltaBetweenOldToCurrentResults.txt')

  callback(null, {
    statusCode: 200,
    body: deltaBetweenOldToCurrentResults
  })
}

function convertIdsToLinks (ids) {
  return ids.map(id => 'https://www.yad2.co.il/item/' + id)
}

