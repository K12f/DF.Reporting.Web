// pages/api/route.js

import dayjs from "dayjs";
import clientPromise from "@/app/db/mongodb";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc)
dayjs.extend(timezone)

export async function POST(req, res) {
    // 获取header中的token
    const token = req.headers.get('token');
    if (!token) {
        return Response.json({
            code: 404, msg: "认证失败", data: null
        })
    }
    // content-type
    const contentType = req.headers.get('content-type');
    if (contentType !== "application/json") {
        return Response.json({
            code: 404, msg: "content-type错误", data: null
        })
    }
    const data = await req.json();

    // 校验数据
    if (!data || data?.zeroDamPd?.code?.length !== 4 || data?.ChanggongValleyPd?.code?.length !== 4 || data?.BakshPd?.code?.length !== 4 || data?.SpaceBasePd?.code?.length !== 4) {
        return Response.json({
            code: 404, msg: "参数错误", data: null
        })
    }
    const client = await clientPromise;

    const db = client.db('delta_force');
    const usersCollection = await db.collection("users");
    const userCount = await usersCollection.countDocuments({token: token});
    if (userCount > 0) {
        const mapPasswordCollection = await db.collection("map_password");
        await mapPasswordCollection.insertOne({
            createdAt: dayjs().tz('Asia/Shanghai').format("YYYY-MM-DD"),
            updatedAt: dayjs().tz('Asia/Shanghai').format("YYYY-MM-DD"), ...data
        });
        return Response.json({
            code: 0, msg: "ok", data: null
        })
    } else {
        return Response.json(
            {
                code: 404,
                msg: "认证失败",
                data: []
            }
        )
    }

}

export async function GET() {
    const client = await clientPromise;
    const db = client.db('delta_force');
    const collection = await db.collection("map_password");

    const today = dayjs().tz("Asia/Shanghai").format("YYYY-MM-DD");
    const filter = {createdAt: today};
    const result = await collection.findOne(filter, {
        sort: {_id: -1}
    });
    if (result) {

        return Response.json(
            {
                code: 0,
                msg: "ok",
                data: result
            }
        )
    }


    const password = {
        createdAt: today,
        updatedAt: today,
        zeroDamPd: {code: "0000", location: "零号大坝",},
        ChanggongValleyPd: {code: "0000", location: "长弓溪谷",},
        BakshPd: {code: "0000", location: "巴克什",},
        SpaceBasePd: {code: "0000", location: "航天基地",},
    }

    const fetchResult = await fetch("https://df-ytl.kwfrb.top/getBonusDoorData", {
        method: "POST",
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-CH-UA": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
            "Sec-CH-UA-Mobile": "?0",
            "Sec-CH-UA-Platform": "\"Windows\"",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "cookie": "PHPSESSID=vs8iognoa6cmq60vlae9283p20"
        },
        body: "version=a484b4a9d52d1c5abb5b72e8c1464603",
        mode: "cors",
        credentials: "include",
        referrer: "https://df-ytl.kwfrb.top/",
        referrerPolicy: "strict-origin-when-cross-origin"
    });

    if (!fetchResult.ok) {
        return Response.json(
            {
                code: 404,
                msg: "not item found",
                data: []
            }
        )
    }
    const data = await fetchResult.json();

    if (data?.code === 1) {
        if (data.data?.db?.password && data.data?.db?.password.length === 4
            && dayjs(data.data.db.updated).tz("Asia/Shanghai").format("YYYY-MM-DD") === today) {
            password.zeroDamPd.code = data.data.db.password;
        }
        if (data.data?.cgxg?.password && data.data?.cgxg?.password.length === 4 && dayjs(data.data?.cgxg?.updated).tz("Asia/Shanghai").format("YYYY-MM-DD") === today) {
            password.ChanggongValleyPd.code = data.data.cgxg.password;
        }
        if (data.data?.bks?.password && data.data?.bks?.password.length === 4 && dayjs(data.data.bks.updated).tz("Asia/Shanghai").format("YYYY-MM-DD") === today) {
            password.BakshPd.code = data.data.bks.password;
        }
        if (data.data?.htjd?.password && data.data?.htjd?.password.length === 4 && dayjs(data.data.htjd.updated).tz("Asia/Shanghai").format("YYYY-MM-DD") === today) {
            password.SpaceBasePd.code = data.data.htjd.password;
        }
    }

    const count = await collection.countDocuments({createdAt: today});
    if (count === 0 && password.zeroDamPd.code !== "0000") {
        await collection.insertOne({
            createdAt: dayjs().format("YYYY-MM-DD"), updatedAt: dayjs().format("YYYY-MM-DD"), ...password
        });
    }

    return Response.json(
        {
            code: 0,
            msg: "ok",
            data: password
        }
    )
}
