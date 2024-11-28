"use client"
import React, {useEffect, useState} from 'react';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {Card, Divider, Image, Spin, Splitter, Tabs, Tag} from "antd";
import ReactECharts from 'echarts-for-react';
import _ from "lodash";
import {getCookie} from "cookies-next";
import {useRouter} from "next/navigation";

const {Meta} = Card;
dayjs.extend(utc)
dayjs.extend(timezone)

export default function Item({params}) {
    const reqParams = React.use(params);
    const name = decodeURIComponent(reqParams.name);
    const cookieToken = getCookie("token");
    const router = useRouter();
    const [loading, setLoading] = useState(false); // 加载状态
    const [data, setData] = useState([]);
    const [chartTabKey, setChartTabKey] = useState(1);
    const [option24h, set24hOption] = useState([]);
    const [option7d, set7dOption] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [percent, setPercent] = React.useState(0);

    useEffect(() => {
        // 拉取密码
        const fetchItem = async () => {
            try {
                setLoading(true)
                setPercent(10)
                const response = await fetch(`/api/item?name=${name}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "cookie": cookieToken
                    },
                });
                if (!response.ok) {
                    throw new Error('网络错误');
                }
                const data = await response.json();
                if (data.code !== 0) {
                    router.push(`/404`);
                }
                setData(data.data)
                setPercent(100)

            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false)
                setPercent(0)
            }
        };
        fetchItem();
    }, []);
    const changeTab = (key) => {
        setChartTabKey(key)
    }

    useEffect(() => {
        setTabs([{
            key: 1, label: `24h`, children: '',
        }, {
            key: 2, label: `7d`, children: '',
        },
        ])
    }, []);


    useEffect(() => {

        let series = [];
        let xAxisData = [];

        if (_.eq(chartTabKey, 1)) {
            series = _.map(data.price24h, 'price');
            xAxisData = _.map(data.price24h, 'formattedDate');

            set24hOption({
                title: {
                    text: name + ' 24h价格趋势'
                },
                graphic: [
                    {
                        type: 'text',
                        left: 'center',
                        top: 'center',
                        style: {
                            text: '三角洲行动-跳蚤市场',
                            fill: 'rgba(0, 0, 0, 0.1)', // 水印颜色和透明度
                            font: 'bold 10px Microsoft YaHei', // 水印字体
                            textAlign: 'center',
                        },
                        z: 10, // 设置 z-index，确保水印在最上层
                    },
                ],
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    feature: {
                        saveAsImage: {
                            type: 'png', title: '保存为图片',
                        }
                    }
                },
                xAxis: {
                    data: xAxisData,
                    boundaryGap: false,
                    axisLabel: {
                        formatter: (value) => dayjs(value).tz("Asia/Shanghai").format("YYYY-MM-DD HH:mm"),
                    },
                    splitLine: {
                        show: true       // 显示网格线
                    }
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    name: "价格",
                    stack: 'Total',
                    type: 'line',
                    data: series,
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '${c}' // 显示数据值
                    },
                    lineStyle: {
                        color: '#5470C6'
                    },
                    itemStyle: {
                        color: '#5470C6'
                    }
                }]
            })
        } else {
            series = _.map(data.price7d, 'price');
            xAxisData = _.map(data.price7d, 'formattedDate');
            set7dOption({
                title: {
                    text: name + ' 7天价格趋势'
                },
                graphic: [
                    {
                        type: 'text',
                        left: 'center',
                        top: 'center',
                        style: {
                            text: '三角洲行动-跳蚤市场',
                            fill: 'rgba(0, 0, 0, 0.1)', // 水印颜色和透明度
                            font: 'bold 10px Microsoft YaHei', // 水印字体
                            textAlign: 'center',
                        },
                        z: 10, // 设置 z-index，确保水印在最上层
                    },
                ],
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    feature: {
                        saveAsImage: {
                            type: 'png', title: '保存为图片'
                        }
                    }
                },
                xAxis: {
                    boundaryGap: false,
                    data: xAxisData,
                    splitLine: {
                        show: true       // 显示网格线
                    },
                    axisLabel: {
                        formatter: (value) => dayjs(value).tz("Asia/Shanghai").format("YYYY-MM-DD HH:mm"),
                    },
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    name: "价格",
                    stack: 'Total',
                    type: 'line',
                    data: series,
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '${c}' // 显示数据值
                    },
                    lineStyle: {
                        color: '#5470C6'
                    },
                    itemStyle: {
                        color: '#5470C6'
                    }
                }]
            })
        }
    }, [chartTabKey, data]);

    const Description = ({data}) => {
        return (<>
            <Card bordered={false} title={data?.name}
                  cover={<Image width={200}
                                src={data?.coverImage ? data?.coverImage : 'https://playerhub.df.qq.com/playerhub/60004/object/p_18010000001.png'}
                                alt="item"/>}
            >
                <Tag color="pink">{data?.primaryClassCN}</Tag>
                <Tag color="gold">{data?.secondClassCN}</Tag>
                <Meta
                    description={data?.desc}/>
            </Card>
        </>)
    }

    return (<div className="px-16 m-auto max-w-screen-2xl" style={{height: "calc(100vh - 100px)"}}>
        {/* 页眉 */}
        <header className="w-full py-4">
            <div className="flex items-center">
                <div className="brand text-sm float-right">

                </div>
            </div>
            <div className="flex justify-between items-center">
                <div className="brand cursor-pointer" onClick={() => {
                    router.push("/")
                }}>
                    <h1 className="text-xl font-bold">三角洲行动</h1>
                    <p className='opacity-70'>交易行价格监控和工具</p>
                </div>
            </div>
        </header>
        <Divider style={{margin: '0'}}/>
        {/* 主内容 */}
        <Splitter layout="vertical">
            <Splitter.Panel size="40%" style={{padding: "0 1rem"}}>
                <Description data={data?.item}/>
            </Splitter.Panel>
            <Splitter.Panel size="60%" style={{padding: "0 1rem"}}>
                <Tabs defaultActiveKey="1" items={tabs} onChange={changeTab}/>
                {chartTabKey === 1 ? <ReactECharts
                        option={option24h}
                        notMerge={true}
                        lazyUpdate={true}
                        theme={"theme_name"}
                        style={{height: 600}}
                    /> :
                    <ReactECharts
                        option={option7d}
                        notMerge={true}
                        lazyUpdate={true}
                        theme={"theme_name"}
                        style={{height: 600}}
                    />}
            </Splitter.Panel>

        </Splitter>
        <Divider className="mb-8" style={{margin: '0'}}/>
        <Spin tip="loading" fullscreen={true} spinning={loading} percent={percent}/>
    </div>);
}
