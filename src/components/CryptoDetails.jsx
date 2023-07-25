import React, { useState, useCallback, useLayoutEffect } from 'react';
import HTMLReactParser from 'html-react-parser';
import { useParams } from 'react-router-dom';
import millify from 'millify';
import axios from "axios";
import { Col, Row, Typography, Select } from 'antd';
import { MoneyCollectOutlined, DollarCircleOutlined, FundOutlined, ExclamationCircleOutlined, StopOutlined, TrophyOutlined, CheckOutlined, NumberOutlined, ThunderboltOutlined } from '@ant-design/icons';

import { useGetCryptoDetailsQuery, useGetCryptoHistoryQuery } from '../services/cryptoApi';
import Loader from './Loader';
import LineChart from './LineChart';
import { MonthlyCoin } from '../services/cryptoApi';

const { Title, Text } = Typography;
const { Option } = Select;

const CryptoDetails = () => {
      
  const [resistance1, setResistance1] = React.useState(0);
  const [resistance2, setResistance2] = React.useState(0);
  const [support1, setSupport1] = React.useState(0);
  const [support2, setSupport2] = React.useState(0);
  const [pivotPoint, setPivotPoint] = React.useState(0);
  const [buy,setbuy] = React.useState("DON'T BUY");


  const { coinId } = useParams();
  const [timeperiod, setTimeperiod] = useState('7d');
  const { data, isFetching } = useGetCryptoDetailsQuery(coinId);
  const { data: coinHistory } = useGetCryptoHistoryQuery({ coinId, timeperiod });
  const cryptoDetails = data?.data?.coin;

  if (isFetching) return <Loader />;
  // console.log(data.data.coin.symbol);
  const time = ['3h', '24h', '7d', '30d', '1y', '3m', '3y', '5y'];
  const month  = {low: "", high: "", close: ""};
  const points = {r1: "", r2: "", pp: "", s1: "", s2: ""};

  const stats = [
    { title: 'Price to USD', value: `$ ${cryptoDetails?.price && millify(cryptoDetails?.price)}`, icon: <DollarCircleOutlined /> },
    { title: 'Rank', value: cryptoDetails?.rank, icon: <NumberOutlined /> },
    // { title: '24h Volume', value: `$ ${cryptoDetails?.volume && millify(cryptoDetails?.volume)}`, icon: <ThunderboltOutlined /> },
    { title: 'Market Cap', value: `$ ${cryptoDetails?.marketCap && millify(cryptoDetails?.marketCap)}`, icon: <DollarCircleOutlined /> },
    { title: 'All-time-high(daily avg.)', value: `$ ${cryptoDetails?.allTimeHigh?.price && millify(cryptoDetails?.allTimeHigh?.price)}`, icon: <TrophyOutlined /> },
    { title: 'Resistance 1', value: `$ ${resistance1}`, icon: <DollarCircleOutlined /> },
    { title: 'Resistance 2', value: `$ ${resistance2}`, icon: <DollarCircleOutlined /> },
    { title: 'Pivot Point', value: `$ ${pivotPoint}`, icon: <DollarCircleOutlined /> },
    { title: 'Support Point 1', value: `$ ${support1}`, icon: <DollarCircleOutlined /> },
    { title: 'Support Point 2', value: `$ ${support2}`, icon: <DollarCircleOutlined /> },
    { title: 'BUY/NOT BUY', value: `$ ${buy}`, icon: <DollarCircleOutlined /> },



  ];

  const genericStats = [
    { title: 'Number Of Markets', value: cryptoDetails?.numberOfMarkets, icon: <FundOutlined /> },
    { title: 'Number Of Exchanges', value: cryptoDetails?.numberOfExchanges, icon: <MoneyCollectOutlined /> },
    { title: 'Aprroved Supply', value: cryptoDetails?.supply?.confirmed ? <CheckOutlined /> : <StopOutlined />, icon: <ExclamationCircleOutlined /> },
    { title: 'Total Supply', value: `$ ${cryptoDetails?.supply?.total && millify(cryptoDetails?.supply?.total)}`, icon: <ExclamationCircleOutlined /> },
    { title: 'Circulating Supply', value: `$ ${cryptoDetails?.supply?.circulating && millify(cryptoDetails?.supply?.circulating)}`, icon: <ExclamationCircleOutlined /> },
  ];

  const fetchPrevCoinData = useCallback(async () => {
    const ex1 = data.data.coin.symbol?.toString() || '';
    // console.log(ex1);
    const MonthlyData = await axios.get(MonthlyCoin(ex1));
   
    // console.log(MonthlyData)
    const neww = MonthlyData.data["Time Series (Digital Currency Weekly)"];
   // console.log(neww["2020-03-15"])
   
    for(var key in neww){
      if(key == "2022-11-20"){
        month.low = neww[key]["3a. low (USD)"];
        month.high = neww[key]["2a. high (USD)"];
        month.close = neww[key]["4a. close (USD)"];
       // console.log(month.low)
      //  console.log(month.high)
      //  console.log(month.close)
      }
    }
   // setPrevCoin(neww);
    // setIsLoading(false);

    // console.log(month);
    // console.log(points);
  
   let high=parseInt(month.high)
   let low=parseInt(month.low)
   let close=parseInt(month.close)
    let pp = (high + low + close) / 3;
   
    let r3 = pp + 2* (high - low)
    let r2 = pp + (high - low)
    let r1 = 2* pp - low
    
    let s1 = 2* pp - high;
    let s2 = pp - (high - low)
    let s3 = pp - 2* (high - low)  
 
    points.r1 = r1;
    points.r2 = r2;
    points.pp = pp;
    points.s1 = s1;
    points.s2 = s2;
    setPivotPoint(points.pp);
    setSupport1(points.s1);
    setSupport2(points.s2);
    setResistance1(points.r1);
    setResistance2(points.r2);
    
  
  });

  console.log(resistance2)
  console.log(resistance1)
  console.log(pivotPoint)
  console.log(support1)
  console.log(support2)
  
 const buynotbuy  =  ()=>{
    if(cryptoDetails?.price>=resistance1 && cryptoDetails?.price<=resistance2){
        setbuy("BUY");
    }
 }

 console.log(buy)

// fetchPrevCoinData();
// buynotbuy();

React.useEffect(() => {
  fetchPrevCoinData();
  buynotbuy();
      
}, [resistance1, buy]);

// console.log("DATATAAA")
// //  console.log(cryptoDetails?.price[currency.toLowerCase()]);
//  console.log(resistance1 - 8)
//  console.log(resistance2)



  return (
    <Col className="coin-detail-container">
      <Col className="coin-heading-container">
        <Title level={2} className="coin-name">
          {data?.data?.coin.name} ({data?.data?.coin.symbol}) Price
        </Title>
        <p>{cryptoDetails.name} live price in US Dollar (USD). View value statistics, market cap and supply.</p>
      </Col>
      <Select defaultValue="7d" className="select-timeperiod" placeholder="Select Timeperiod" onChange={(value) => setTimeperiod(value)}>
        {time.map((date) => <Option key={date}>{date}</Option>)}
      </Select>
      <LineChart coinHistory={coinHistory} currentPrice={millify(cryptoDetails?.price)} coinName={cryptoDetails?.name} />
      <Col className="stats-container">
        <Col className="coin-value-statistics">
          <Col className="coin-value-statistics-heading">
            <Title level={3} className="coin-details-heading">{cryptoDetails.name} Value Statistics</Title>
            <p>An overview showing the statistics of {cryptoDetails.name}, such as the base and quote currency, the rank, and trading volume.</p>
          </Col>
          {stats.map(({ icon, title, value }) => (
            <Col className="coin-stats">
              <Col className="coin-stats-name">
                <Text>{icon}</Text>
                <Text>{title}</Text>
              </Col>
              <Text className="stats">{value}</Text>
            </Col>
          ))}
        </Col>
        <Col className="other-stats-info">
          <Col className="coin-value-statistics-heading">
            <Title level={3} className="coin-details-heading">Other Stats Info</Title>
            <p>An overview showing the statistics of {cryptoDetails.name}, such as the base and quote currency, the rank, and trading volume.</p>
          </Col>
          {genericStats.map(({ icon, title, value }) => (
            <Col className="coin-stats">
              <Col className="coin-stats-name">
                <Text>{icon}</Text>
                <Text>{title}</Text>
              </Col>
              <Text className="stats">{value}</Text>
            </Col>
          ))}
        </Col>
      </Col>
      <Col className="coin-desc-link">
        <Row className="coin-desc">
          <Title level={3} className="coin-details-heading">What is {cryptoDetails.name}?</Title>
          {HTMLReactParser(cryptoDetails.description)}
        </Row>
        <Col className="coin-links">
          <Title level={3} className="coin-details-heading">{cryptoDetails.name} Links</Title>
          {cryptoDetails.links?.map((link) => (
            <Row className="coin-link" key={link.name}>
              <Title level={5} className="link-name">{link.type}</Title>
              <a href={link.url} target="_blank" rel="noreferrer">{link.name}</a>
            </Row>
          ))}
        </Col>
      </Col>
    </Col>
  );
};

export default CryptoDetails;
