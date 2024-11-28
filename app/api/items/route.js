// pages/api/route.js

import clientPromise from "@/app/db/mongodb";
import _ from "lodash";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {Collection_ItemPrice, Collection_Items} from "@/app/db/collection";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(req, res) {
    const {searchParams} = new URL(req.url);
    const category = searchParams.get('category');
    const childCategory = searchParams.get('childCategory');
    const searchText = searchParams.get('searchText');
    const page = _.toSafeInteger(searchParams.get('page')) || 1;
    const pageSize = _.toSafeInteger(searchParams.get('pageSize')) || 10;

    const client = await clientPromise;
    const db = client.db('delta_force');
    const collection = await db.collection(Collection_Items);

    const filter = {show: true};
    const sort = {};
    if (searchText) {
        filter.objectName = {$regex: searchText, $options: 'i'}
    }
    sort.ratio_24h = -1;
    sort.ratio_7d = -1;

    if (category) {
        sort.score = -1;
        sort.price = -1;
        filter.primaryClassCN = category
    }
    if (category && childCategory) {
        filter.$or = [{secondClassCN: childCategory}, {thirdClassCN: childCategory},];
    }
    sort.ratio_24h = -1;
    sort.lastUpdated = -1;
    sort._id = 1;
    const count = await collection.countDocuments(filter);
    if (count === 0) {
        return Response.json({
            code: 404, msg: "not item found", data: []
        })
    }
    const skip = (page - 1) * pageSize

    const now = dayjs();
    const last24Hours = now.subtract(24, 'hour').toDate();
    const previous24Hours = now.subtract(48, 'hour').toDate();
    const last7Days = now.subtract(7, 'day').toDate();
    const previous7Days = now.subtract(14, 'day').toDate();


    const results = await collection.aggregate([{
        $match: filter
    }, {
        $lookup: {
            from: Collection_ItemPrice, localField: "objectID", foreignField: "objectID", as: "price_docs"
        }
    }, // 过滤 price_docs 中价格大于 0 的数据
        {
            $addFields: {
                today: {
                    $dateToString: {format: "%Y-%m-%d", date: new Date()} // 获取当天日期
                }
            }
        },
        {
            $addFields: {
                price_today_max: {
                    $max: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$price_docs",
                                    as: "doc",
                                    cond: {
                                        $and: [
                                            {$gt: ["$$doc.price", 0]}, // 价格大于0
                                            {
                                                $eq: [
                                                    {
                                                        $dateToString: {format: "%Y-%m-%d", date: "$$doc.createdAt"} // 文档日期
                                                    },
                                                    "$today" // 当天日期
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            as: "filteredDoc",
                            in: "$$filteredDoc.price" // 只取价格字段
                        }
                    }
                },
                price_today_min: {
                    $min: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$price_docs",
                                    as: "doc",
                                    cond: {
                                        $and: [
                                            {$gt: ["$$doc.price", 0]}, // 价格大于0
                                            {
                                                $eq: [
                                                    {
                                                        $dateToString: {format: "%Y-%m-%d", date: "$$doc.createdAt"} // 文档日期
                                                    },
                                                    "$today" // 当天日期
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            as: "filteredDoc",
                            in: "$$filteredDoc.price" // 只取价格字段
                        }
                    }
                },
                price_latest: {
                    $arrayElemAt: [
                        {
                            $slice: [
                                {
                                    $filter: {
                                        input: "$price_docs",
                                        as: "doc",
                                        cond: {$gt: ["$$doc.price", 0]} // 过滤出价格大于0的数据
                                    }
                                },
                                -1 // 保留最后一个（最新的）价格
                            ]
                        },
                        0
                    ]
                },
                lastUpdated: {
                    $arrayElemAt: [
                        {
                            $slice: [
                                {
                                    $filter: {
                                        input: "$price_docs",
                                        as: "doc",
                                        cond: {$gt: ["$$doc.price", 0]} // 过滤出价格大于0的数据
                                    }
                                },
                                -1 // 保留最后一个（最新的）价格
                            ]
                        },
                        0
                    ]
                },
                price_prev: {
                    $arrayElemAt: [
                        {
                            $slice: [
                                {
                                    $filter: {
                                        input: "$price_docs",
                                        as: "doc",
                                        cond: {$gt: ["$$doc.price", 0]}
                                    }
                                },
                                -2, 1 // 倒数第二条记录
                            ]
                        },
                        0
                    ]
                },
                price_docs_last_24h: {
                    $filter: {
                        input: "$price_docs", as: "doc", cond: {
                            $and: [{$gt: ["$$doc.price", 0]}, {$gte: ["$$doc.updatedAt", last24Hours]}]
                        }
                    }
                }, price_docs_previous_24h: {
                    $filter: {
                        input: "$price_docs", as: "doc", cond: {
                            $and: [{$gt: ["$$doc.price", 0]}, {$gte: ["$$doc.updatedAt", previous24Hours]}, {$lt: ["$$doc.updatedAt", last24Hours]}]
                        }
                    }
                }, price_docs_previous_7d: {
                    $filter: {
                        input: "$price_docs", as: "doc", cond: {
                            $and: [{$gt: ["$$doc.price", 0]}, {$gte: ["$$doc.updatedAt", previous7Days]}, {$lt: ["$$doc.updatedAt", last7Days]}]
                        }
                    }
                }, price_docs_last_7d: {
                    $filter: {
                        input: "$price_docs", as: "doc", cond: {
                            $and: [{$gt: ["$$doc.price", 0]}, {$gte: ["$$doc.updatedAt", last7Days]}]
                        }
                    }
                }
            }
        }, {
            $addFields: {
                avg_price_last_24h: {
                    $cond: {
                        if: {$gt: [{$size: "$price_docs_last_24h"}, 0]},
                        then: {$avg: "$price_docs_last_24h.price"},
                        else: 0
                    }
                }, avg_price_previous_24h: {
                    $cond: {
                        if: {$gt: [{$size: "$price_docs_previous_24h"}, 0]},
                        then: {$avg: "$price_docs_previous_24h.price"},
                        else: 0
                    }
                }, avg_price_last_7d: {
                    $cond: {
                        if: {$gt: [{$size: "$price_docs_last_7d"}, 0]},
                        then: {$avg: "$price_docs_last_7d.price"},
                        else: 0
                    }
                }, avg_price_previous_7d: {
                    $cond: {
                        if: {$gt: [{$size: "$price_docs_previous_7d"}, 0]},
                        then: {$avg: "$price_docs_previous_7d.price"},
                        else: 0
                    }
                },
            }
        }, {
            $addFields: {
                ratio_last: {
                    $cond: {
                        if: {$and: [{$ne: ["$price_latest.price", 0]}, {$ne: ["$price_prev.price", 0]}]}, then: {
                            $divide: [{$subtract: ["$price_latest.price", "$price_prev.price"]}, "$price_prev.price"]
                        }, else: 0
                    }
                }, // 计算7天环比，默认为0
                ratio_24h: {
                    $cond: {
                        if: {$and: [{$ne: ["$avg_price_previous_24h", 0]}, {$ne: ["$avg_price_last_24h", 0]}]}, then: {
                            $divide: [{$subtract: ["$avg_price_last_24h", "$avg_price_previous_24h"]}, "$avg_price_previous_24h"]
                        }, else: 0
                    }
                }, // 计算7天环比，默认为0
                ratio_7d: {
                    $cond: {
                        if: {$and: [{$ne: ["$avg_price_last_7d", 0]}, {$ne: ["$avg_price_previous_7d", 0]}]}, then: {
                            $divide: [{$subtract: ["$avg_price_last_7d", "$avg_price_previous_7d"]}, "$avg_price_previous_7d"]
                        }, else: 0
                    }
                }
            }
        }, {
            $project: {
                _id: 0, // 排除 _id 字段
                id: 1,
                name: "$objectName",
                coverImage: "$prePic",
                image: "$pic",
                primaryClassCN: 1,
                secondClassCN: 1,
                desc: 1,
                score: 1,
                level: "$grade",
                price_today_max: 1,
                price_today_min: 1,
                avg_price_previous_24h: 1,
                avg_price_last_24h: 1,
                avg_price_last_7d: 1,
                ratio_24h: 1,
                ratio_7d: 1,
                ratio_last: 1,
                price: "$price_latest.price",
                price_prev: "$price_prev.price",
                lastUpdated: "$lastUpdated.createdAt",
            }
        }, {
            $sort: sort // 根据 price_docs 中的 price 字段进行升序排序，使用 -1 表示降序
        }, {
            $skip: skip
        }, {
            $limit: pageSize
        }]).toArray();

    // const item = await collection.find(filter).skip(skip).limit(pageSize).toArray();
    // 将价格提取到每个结果中
    const formattedResults = results.map(item => {
        // 提取 price_docs 中的价格，如果没有则默认为 0
        // const itemPriceDocs = item.price_docs;
        // const price = itemPriceDocs.length > 0 ? itemPriceDocs[itemPriceDocs.length - 1].price : 0;
        // const priceUpdatedAt = itemPriceDocs.length > 0 ? itemPriceDocs[itemPriceDocs.length - 1].updatedAt : "";
        const price_prev = +item.price_prev || 0;
        const price = +item.price || 0;
        const price_today_max = +item.price_today_max || 0;
        const price_today_min = +item.price_today_min || 0;
        const ratio_last = +item.ratio_last || 0;
        const ratio_24h = +item.ratio_24h || 0;
        const ratio_7d = +item.ratio_7d || 0;
        const avg_price_last_7d = Math.ceil(item.avg_price_last_7d) || 0;
        const avg_price_previous_24h = Math.ceil(item.avg_price_previous_24h) || 0;
        const avg_price_last_24h = Math.ceil(item.avg_price_last_24h) || 0;
        const lastUpdated = dayjs(item.lastUpdated).tz("Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss");
        // 过滤价格为0的数据
        return {
            ...item,                 // 保留其他字段
            ratio_last,
            price,
            price_today_min,
            price_today_max,
            price_prev,
            lastUpdated,
            ratio_24h, ratio_7d, avg_price_last_7d, avg_price_previous_24h, avg_price_last_24h,
        };
    });

    return Response.json({
        code: 0, msg: "ok", data: formattedResults
    })
}
