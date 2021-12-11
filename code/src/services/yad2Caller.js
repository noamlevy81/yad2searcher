const axios = require('axios')
const HttpsProxyAgent = require("https-proxy-agent")

const filesManager = require('../services/filesManager')
var needle = require('needle');


const httpsAgent = new HttpsProxyAgent({
    host: '45.136.228.161',
    port: 6216
})

const axiosWithProxy = axios.create({httpAgent: httpsAgent})
const search = async (city, neighborhood, name, rooms, filesDir) => {
    return new Promise(async (resolve, reject) => {
        try {
            // const res = await axios.get(`https://www.yad2.co.il/api/pre-load/getFeedIndex/realestate/forsale?city=${city}&neighborhood=${neighborhood}&property=1&rooms=${rooms}&price=1850000-2200000&parking=1&elevator=1`,
            //     {
            //         headers: {
            //             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.31',
            //             'Accept': '*/*',
            //             'Accept-Encoding': 'gzip, deflate, br',
            //             'Connection': 'keep-alive'
            //         },
            //         proxy: {
            //             host: '81.218.45.150',
            //             port: '5678'
            //         }
            //     })


            const res = await needle('get',
                `https://www.yad2.co.il/api/pre-load/getFeedIndex/realestate/forsale?city=${city}&neighborhood=${neighborhood}&property=1&rooms=${rooms}&price=1850000-2200000&parking=1&elevator=1`,
                {
                    proxy: 'http://82.166.23.228:8888',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.31',
                        'Accept': '*/*',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive'
                    }
                })
            // const res = await axiosWithProxy({
            //     url: `https://www.yad2.co.il/api/pre-load/getFeedIndex/realestate/forsale?city=${city}&neighborhood=${neighborhood}&property=1&rooms=${rooms}&price=1850000-2200000&parking=1&elevator=1`,
            //     headers: {
            //         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.31',
            //         'Accept': '*/*',
            //         'Accept-Encoding': 'gzip, deflate, br',
            //         'Connection': 'keep-alive'
            //     },
            //     // proxy: {
            //     //     protocol: 'https',
            //     //     host: '81.218.45.150',
            //     //     port: 5678
            //     // }
            // })

            console.log(res)
            await filesManager.write(JSON.stringify(res.body.feed.feed_items), `${filesDir}/${name}.json`)

            const filteredResults = filterResults(res)
            console.log(`Search ${name} finished successfully`)
            resolve(filteredResults)

        } catch (ex) {
            console.log(`Search ${name} failed with error: ${ex}`)
            reject(ex)
        }
    })
}

const filterResults = (results) => {
    let linkTokens
    try {
        linkTokens = results.body.feed.feed_items.filter(item => item.type === 'ad').map(item => item.link_token)
    } catch (ex) {
        throw new Error(`failed to extract results from result: ${JSON.stringify(results.body)}`)
    }
    return Object.values(linkTokens)
}

module.exports = {
    search: search
}