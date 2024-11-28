// pages/api/route.js

import clientPromise from "@/app/db/mongodb";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {Collection_ItemPrice, Collection_Items} from "@/app/db/collection";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(req, res) {
    const {searchParams} = new URL(req.url);
    const name = searchParams.get('name');

    const client = await clientPromise;
    const db = client.db('delta_force');

    if (!name) {
        return Response.json({error: "No name provided"})
    }
    const itemCollection = await db.collection(Collection_Items);
    const itemPriceCollection = await db.collection(Collection_ItemPrice);

    const filter = {objectName: name, show: true};

    const count = await itemCollection.countDocuments(filter);
    if (count === 0) {
        return Response.json({
            code: 404, msg: "not item found", data: []
        })
    }

    // 定义需要返回的字段
    const projection = {
        _id: 0, // 排除 _id 字段
        id: 1,
        objectID: 1,
        name: "$objectName",
        coverImage: "$prePic",
        image: "$pic",
        primaryClassCN: 1,
        secondClassCN: 1,
        desc: 1,
    };

    const item = await itemCollection.findOne(filter, {projection});

    // 价格不为0

    const price24HFilter = {
        objectID: item.objectID, price: {$ne: 0}, createdAt: {$gt: dayjs().subtract(24, 'hour').toDate()}
    };

    const price7dFilter = {
        objectID: item.objectID, price: {$ne: 0}, createdAt: {$gt: dayjs().subtract(7, 'day').toDate()}
    };

    const price24h = await itemPriceCollection.aggregate([{
        $match: price24HFilter // 应用过滤条件
    }, {
        $project: {
            _id: 0, createdAt: 1, updatedAt: 1, price: 1, formattedDate: {
                $dateToString: {
                    format: "%Y-%m-%d %H:%M:%S", // 自定义格式
                    date: "$createdAt", // 替换为你的日期字段
                    timezone: "Asia/Shanghai" // 指定时区
                }
            }
        }
    }]).toArray();
    const price7d = await itemPriceCollection.aggregate([{
        $match: price7dFilter // 应用过滤条件
    }, {
        $project: {
            _id: 0, createdAt: 1, updatedAt: 1, price: 1, formattedDate: {
                $dateToString: {
                    format: "%Y-%m-%d %H:%M:%S", // 自定义格式
                    date: "$createdAt", // 替换为你的日期字段
                    timezone: "Asia/Shanghai" // 指定时区
                }
            }
        }
    }]).toArray();
    // 获取 24h价格数据

    const result = {
        item: item, price24h: price24h, price7d: price7d
    }


    return Response.json({
        code: 0, msg: "ok", data: result
    })
}
