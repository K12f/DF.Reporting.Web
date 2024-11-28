"use client"
import React, {useEffect, useState} from 'react';
import {Button, Divider, Image, Menu, message, Table, Tag, Typography} from "antd";
import _ from 'lodash'
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {useRouter} from 'next/navigation';
import Search from 'antd/lib/input/Search'
import {getCookie} from "cookies-next";

dayjs.extend(utc)
dayjs.extend(timezone)

// const {Search} = Input;
const {Text, Link} = Typography;

export default function Home(req) {

    const cookieToken = getCookie("token");

    const router = useRouter();

    const [loading, setLoading] = useState(false); // 加载状态
    const [page, setPage] = useState(1); // 当前页码
    // const [pageSize, setPageSize] = useState(10); // 当前页码
    const [hasMore, setHasMore] = useState(false); // 是否还有更多数据
    const [availableTags, setAvailableTags] = useState([]);
    const [mapPassword, setMapPassword] = useState([]);
    const [category, setCategory] = useState("");
    const [childCategory, setChildCategory] = useState("");
    const [items, setItems] = useState([])
    const [searchText, setSearchText] = useState("")

    // 拉取数据

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                // 定义查询参数
                const params = {
                    searchText: searchText, category: category, childCategory: childCategory, page: page, pageSize: 10,
                };
                // 将查询参数转换为 URL 查询字符串
                const queryString = new URLSearchParams(params).toString();

                const response = await fetch(`/api/items?${queryString}`, {
                    method: 'GET', headers: {
                        'Content-Type': 'application/json', "cookie": cookieToken
                    },
                });

                setHasMore(true);

                if (!response.ok) {
                    throw new Error('网络错误');
                }
                const data = await response.json();
                if (data.code !== 0) {
                    throw new Error(data.msg);
                }
                if (Object.keys(data.data).length < params.pageSize) {
                    setHasMore(false);
                }
                if (_.isArray(data.data)) {
                    page === 1 ? setItems(data.data) : setItems(_.concat(items, data.data));
                }
            } catch (err) {
                console.log(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [page, category, childCategory, searchText]);


    useEffect(() => {
        // 拉取标签
        const fetchTags = async () => {
            try {
                const response = await fetch(`/api/tag`, {
                    method: 'GET', headers: {
                        'Content-Type': 'application/json', "cookie": cookieToken
                    },
                });
                if (!response.ok) {
                    throw new Error('网络错误');
                }
                const data = await response.json();
                if (data.code !== 0) {
                    throw new Error(data.msg);
                }
                setAvailableTags(data.data)
            } catch (e) {

            }
        };

        fetchTags();
    }, []);

    const loadMoreData = () => {
        if (!hasMore) return;
        setPage(() => page + 1)
    };

    const changeTag = (category, changed) => {
        setCategory(() => category.category)
        setPage(() => 1)
        setChildCategory("")
    };

    const changeChildTag = (childCategory, changed) => {
        setChildCategory(() => childCategory.category)
        setPage(() => 1)
    };

    const onSearch = (value, _e, info) => {
        try {
            if (_.isEmpty(value)) {
                return
            }
            setSearchText(() => value)
            setPage(() => 1)
            // setItems([])
            setCategory("")
            setChildCategory("")
        } catch (err) {
            console.log(err)
        }
    }

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                message.success('文字已复制到剪贴板！');
            })
            .catch(() => {
                message.error('复制失败');
            });
    };

    const columns = [{
        title: '图片', dataIndex: 'coverImage', key: 'coverImage', render: (coverImage) => (<Image
            src={coverImage}
            alt="物品图片"
            width={100}
            height={100}
            style={{objectFit: 'cover'}} // 调整图片的大小和样式
        />),
    }, {
        title: '名称', dataIndex: 'name', key: 'name', render: (name, record) => {
            // console.log(record);
            let color;
            let level = record.level || 0;
            // const color = "#fff";

            switch (level) {
                case 2:
                    color = "#2B4B4A";
                    break;
                case 3:
                    color = "blue";
                    break;
                case 4:
                    color = "purple";
                    break;
                case 5:
                    color = "gold";
                    break;
                case 6:
                    color = "red";
                    break;
                default:
                    color = "#000";
                    break;
            }
            return <Text
                onClick={() => handleCopy(name)}
                style={{cursor: 'pointer', color: color,}}
            >
                {name}
            </Text>
        },
    }, {
        title: '主类别',
        dataIndex: 'primaryClassCN',
        key: 'primaryClassCN',
        render: (primaryClassCN) => (<Tag color="pink">{primaryClassCN}</Tag>),
    }, {
        title: '分类',
        dataIndex: 'secondClassCN',
        key: 'secondClassCN',
        render: (secondClassCN) => (<Tag color="gold">{secondClassCN}</Tag>),
    }, {
        title: "当前价格", dataIndex: 'price', key: 'price', sorter: (a, b) => {
            return +a.price - +b.price;
        }, render: (price) => (<Text type="danger">{price}</Text>),
    }, {
        title: "今日最高价", dataIndex: 'price_today_max', key: 'price_today_max', sorter: (a, b) => {
            return +a.price_today_max + b.price_today_max;
        }, render: (price_today_max) => (<Text type="danger">{price_today_max}</Text>),
    },
        {
            title: '今日最低价',
            dataIndex: 'price_today_min',
            key: 'price_today_min',
            sorter: (a, b) => +a.price_today_min - +b.price_today_min,
        },
        {
            title: '今日均价(24h)',
            dataIndex: 'avg_price_last_24h',
            key: 'avg_price_last_24h',
            sorter: (a, b) => +a.avg_price_last_24h - +b.avg_price_last_24h,
        },
        //     {
        //     title: '昨日均价(24h)',
        //     dataIndex: 'avg_price_previous_24h',
        //     key: 'avg_price_previous_24h',
        //     sorter: (a, b) => +a.avg_price_previous_24h - +b.avg_price_previous_24h,
        // },
        {
            title: '最近7d均价',
            dataIndex: 'avg_price_last_7d',
            key: 'avg_price_last_7d',
            sorter: (a, b) => +a.avg_price_last_7d - +b.avg_price_last_7d,
        },
        // {
        //     title: '环比', dataIndex: 'ratio_last', key: 'ratio_last', render: (value) => {
        //         // 判断是否大于0
        //         const color = value > 0 ? 'red' : "green";
        //         return <Tag color={color}>{_.ceil(value * 100)}%</Tag>;
        //
        //     }, sorter: (a, b) => +a.ratio_last - +b.ratio_last,
        // }, 
        {
            title: '24h环比', dataIndex: 'ratio_24h', key: 'ratio_24h', render: (value) => {
                // 判断是否大于0
                const color = value > 0 ? 'red' : "green";
                return <Tag color={color}>{_.ceil(value * 100)}%</Tag>;

            }, sorter: (a, b) => +a.ratio_24h - +b.ratio_24h,
        },
        {
            title: '7d环比', dataIndex: 'ratio_7d', key: 'ratio_7d', render: (value) => {
                // 判断是否大于0
                const color = value > 0 ? 'red' : "green";
                return <Tag color={color}>{_.ceil(value * 100)}%</Tag>;

            }, sorter: (a, b) => +a.ratio_7d - +b.ratio_7d,
        },
        {
            title: '更新时间', dataIndex: 'lastUpdated', key: 'lastUpdated', render: (lastUpdated) => (<Text
                type="secondary">{lastUpdated}</Text>),
        },
        {
            title: '价格趋势图', dataIndex: 'name', key: 'toDetail', render: (name) => (
                <Link href={`/item/${name}`} target={'_blank'}>查看</Link>
            )
        },
    ];

    // const onRowOptions = ((record) => ({
    //     onClick: () => {
    //         const itemName = record.name;
    //         router.push(`/item/${itemName}`);
    //     }
    // }))

    return (<div className="page-content flex flex-col px-16 m-auto w-4/5">
        {/* 页眉 */}
        <header className="w-full py-4">
            <div className="flex items-center">
                <div className="brand text-sm float-right">

                </div>
            </div>
            <div className="flex justify-between items-center">
                <div className="brand cursor-pointer" onClick={() => window.history.go(0)}>
                    <h1 className="text-xl font-bold">三角洲行动-S2-美杜莎</h1>
                    <p className='opacity-70'>交易行价格监控和工具</p>
                </div>
                <Menu mode="horizontal" className="flex w-2/4">
                    {/*<Link href="/gunCode" className="hover:opacity-70 mr-10">改枪码</Link>*/}
                    <Menu.Item key="map">
                        <Link href="https://df.qq.com/cp/a20240729directory/" target="_blank">资源地图</Link>
                    </Menu.Item>
                    <Menu.Item key="author">
                        <Link href="https://www.douyin.com/user/self?_sw=4383131576307840"
                              target="_blank">给作者抖音点个关注吧</Link>
                    </Menu.Item>
                </Menu>
                {/*<Flex wrap>*/}
                {/*    <Tag color="geekblue">{mapPassword?.createdAt}</Tag>*/}
                {/*    <Tag color="magenta">{mapPassword?.zeroDamPd?.location}: {mapPassword?.zeroDamPd?.code}</Tag>*/}
                {/*    <Tag*/}
                {/*        color="red">{mapPassword?.ChanggongValleyPd?.location}: {mapPassword?.ChanggongValleyPd?.code}</Tag>*/}
                {/*    <Tag color="volcano">{mapPassword?.BakshPd?.location}: {mapPassword?.BakshPd?.code}</Tag>*/}
                {/*    <Tag color="orange">{mapPassword?.SpaceBasePd?.location}: {mapPassword?.SpaceBasePd?.code}</Tag>*/}
                {/*</Flex>*/}
            </div>
        </header>
        <Divider style={{margin: '0'}}/>
        {/* 主内容 */}
        <div className="w-full">
            <h2 className="text-xl mb-4">交易行实时价格监控</h2>
            <Search
                placeholder="输入道具名"
                allowClear
                size="large"
                enterButton="搜索"
                onSearch={onSearch}
            />
            {/* 筛选项 */}
            <div className="my-1 inline-block text-sm ml-4">
                {availableTags.map((tag) => (<Tag.CheckableTag key={tag.id}
                                                               checked={category === tag.category}
                                                               onChange={(checked) => changeTag(tag, checked)}>
                    {tag.category}
                </Tag.CheckableTag>))}
            </div>
            <div className="my-1 text-sm ml-4">
                {availableTags.find(tag => tag.category === category)?.child.map((tagChild) => (
                    <Tag.CheckableTag key={tagChild.id}
                                      checked={childCategory === tagChild.category}
                                      onChange={(childChecked) => changeChildTag(tagChild, childChecked)}>
                        {tagChild.category}

                    </Tag.CheckableTag>))}
            </div>
            <Table style={{maxHeight: 'calc(100vh - 300px)', overflow: 'auto'}}
                   className="my-4 text-center"
                   dataSource={items}
                   pagination={false}
                   columns={columns}
                   rowKey='id'
                   loading={loading}
                   scroll={{y: 800}}
                // onRow={onRowOptions}
            />
            {hasMore ?
                <Button className="big w-full text-center py-4 z-40" onClick={loadMoreData} loading={loading}
                        variant="outlined">加载更多
                </Button> : null}

        </div>
        {/* 页脚 */}
        <Divider style={{margin: '0'}}/>
    </div>);
}