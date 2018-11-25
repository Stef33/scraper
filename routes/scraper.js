const express = require("express")
const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const searchAndReplaceInFile = require('../helpers/SearchAndReplaceInFile.js')
const cleanHtml = require('../helpers/CleanHtml.js')

const router = express.Router()

router.get("/", (req, res, next) => {
  searchAndReplaceInFile(/\\\"/g, '"', "./views/test.html", "./views/temporary1.html")
  searchAndReplaceInFile(/(?:\\[rn])+/g, "", "./views/temporary1.html", "./views/temporary2.html")

  cleanHtml("./views/temporary2.html", "./views/test-cleaned.html")


      const $ = cheerio.load(fs.readFileSync('./views/test-cleaned.html', 'utf8'))

      if(!$) {
          return res.status(500).send('Error...')
      }

      let status = 'ok'
      let code = ''
      let name = ''

      $('table[class="block-pnr"]')
      .find('tbody > tr > td > span')
      .each((i, element) => {
        if ($(element).text() == 'SNIKXP') {
          code = $(element).text()
        } else if ($(element).text() == 'dupont') {
          name = $(element).text()
        }
      })

      let price = $('td.very-important').text()

      let types = []

      $('td.travel-way').each((i, element) => {
          let type = $(element).text()
          types.push(type)
      })

      let dates = []

      $('td.product-travel-date').each((i, element) => {
          let date = $(element).text()
          date = JSON.stringify(date)
          date = date.replace(/ {1,}/g," ")
          date = date.replace(/\\n/g, "")
          date = date.replace(/"/g, "")
          dates.push(date)
      })

      let departureTimes = []

      $('td.origin-destination-hour.segment-departure').each((i, element) => {
          let departure = $(element).text()
          departureTimes.push(departure)
      })

      let departureStations = []

      $('td.origin-destination-station.segment-departure').each((i, element) => {
          let station = $(element).text()
          departureStations.push(station)
      })

      let arrivalTimes = []

      $('td.origin-destination-border.origin-destination-hour.segment-arrival')
      .each((i, element) => {
          let arrival = $(element).text()
          arrivalTimes.push(arrival)
      })

      let arrivalStations = []

      $('td.origin-destination-border.origin-destination-station.segment-arrival')
      .each((i, element) => {
          let station = $(element).text()
          arrivalStations.push(station)
      })

      let trainsType = []

      $('td.origin-destination-station.segment-departure')
      .next()
      .each((i, element) => {
          let type = $(element).text()
          trainsType.push(type)
      })

      let trainNumber = []

      $('td.segment.segment-departure')
      .prev()
      .each((i, element) => {
          let number = $(element).text()
          trainNumber.push(number)
      })

      let prices = []

      $('table[class="product-header"]')
      .find('td.cell')
      .each((i, element) => {
          let string = $(element).text()
          string = string.replace(',', '.')
          let float = parseFloat(string)
          let productPrice = {}
          if(!isNaN(float)) {
              productPrice = { "value": float }
              prices.push(productPrice)
          }
      })

      let amount = $('td.amount').text()
      amount = amount.replace(',', '.')
      let floatAmount = parseFloat(amount)
      let amountPrice = {
          "value": floatAmount
      }
      prices.push(amountPrice)

      let details = {}
      details.price = price

      let allTrains = []

      for(i=0;i<trainNumber.length;i++){
        let currentTrain = {
          "departureTime": departureTimes[i],
          "departureStation": departureStations[i],
          "arrivalTime": arrivalTimes[i] ,
          "arrivalStation": arrivalStations[i],
          "type": trainsType[i],
          "number": trainNumber[i]
        }
        allTrains.push(currentTrain)
      }

      let passengers = []

      let passengerAge = []

      $('div[id="travel-0"]')
      .find('td.typology')
      .each((i, element) => {
          let age = $(element).after('<br>').text()
          age = JSON.stringify(age)
          age = age.replace(/ {1,}/g," ")
          age = age.replace(/\\n/g, "")
          age = age.replace(/"/g, "")
          age =age.trim()
          if(i == 1 || i == 0) {
              if(i == 0) {
                  age = age.replace('1e passager  ', '')
              } else if (i == 1) {
                  age = age.replace('2e passager  ', '')
              }
              passengerAge.push(age)
          }
      })

      $('div[id="travel-1"]')
      .find('td.typology')
      .each((i, element) => {
          let age = $(element).after('<br>').text()
          age = JSON.stringify(age)
          age = age.replace(/ {1,}/g," ")
          age = age.replace(/\\n/g, "")
          age = age.replace(/"/g, "")
          age =age.trim()
          if(i == 1 || i == 0) {
              if(i == 0) {
                  age = age.replace('1e passager  ', '')
              } else if (i == 1) {
                  age = age.replace('2e passager  ', '')
              }
              passengerAge.push(age)
          }
      })

      for(i=0;i<passengerAge.length;i++) {
          let currentPassenger = {
              "type": "échangeable",
              "age": passengerAge[i]
          }
          passengers.push(currentPassenger)
      }

      allTrains[allTrains.length-1].passengers = passengers

      let roundTrips = []

      for (i=0;i<dates.length;i++) {
          let currentTrip = {
            "type" : types[i] ,
            "date" : dates[i] ,
            "trains" : [ allTrains[i] ]
          }
          roundTrips.push(currentTrip)
      }

      details.roundTrips = roundTrips

      let json = {}

      json.status = status

      let trips = [
          {
            "code": code,
            "name": name,
            "details": details
          }
      ]
      json.result = trips

      json.custom = {
          "prices": prices
      }

  res.status(200).json(json)


})

module.exports = router;
