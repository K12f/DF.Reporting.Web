// pages/api/route.js

export async function GET() {
    const category = [{
        id: 1, category: '枪械', child: [{
            id: 1, category: '步枪'
        }, {id: 2, category: '冲锋枪'}, {id: 3, category: '狙击步枪'}, {id: 4, category: '霰弹枪'}, {
            id: 5,
            category: '射手步枪'
        }, {id: 6, category: '轻机枪'}, {id: 9, category: '手枪'},]
    }, {
        id: 2,
        category: '装备',
        child: [{id: 1, category: '头盔'}, {id: 2, category: '护甲'}, {id: 3, category: '胸挂'}, {
            id: 4, category: '背包'
        },]
    }, {
        id: 3, category: '配件', child: [{
            id: 1, category: "弹匣",
        }, {
            id: 2, category: "瞄具",
        }, {
            id: 3, category: "护木",
        }, {
            id: 4, category: "枪管",
        }, {
            id: 5, category: "枪口",
        }, {
            id: 6, category: "枪托",
        }, {
            id: 7, category: "前握把",
        }, {
            id: 8, category: "后握把",
        }, {
            id: 9, category: "功能性配件",
        }]
    }, {
        id: 4, category: '弹药', child: [
            // {id: 1, category: ".338 Lap Mag"},
            {id: 2, category: ".357 Magnum"},
            {id: 3, category: ".45 ACP"},
            {id: 4, category: ".50 AE"},
            {id: 5, category: "12 Gauge"},
            {id: 6, category: "12.7x55mm"},
            {id: 7, category: "4.6x30mm"},
            {id: 8, category: "5.45x39mm"},
            {id: 9, category: "5.56x45mm"},
            {id: 10, category: "5.7x28mm"},
            {id: 11, category: "5.8x42mm"},
            {id: 12, category: "6.8x51mm"},
            {id: 13, category: "7.62x39mm"},
            {id: 14, category: "7.62x51mm"},
            {id: 15, category: "7.62x54mm"},
            {id: 16, category: "9x19mm"},
            {id: 17, category: "9x39mm"}
        ]
    }, {
        id: 5,
        category: '收集品',
        child: [{id: 1, category: "电子物品"}, {id: 2, category: "医疗道具"}, {id: 3, category: "工具材料"}, {
            id: 4,
            category: "家居物品"
        }, {id: 5, category: "工艺藏品"}, {id: 6, category: "资料情报"},]
    }, {
        id: 6,
        category: '消耗品',
        child: [{id: 1, category: "药品"}, {id: 2, category: "维修套件"}, {id: 3, category: "针剂"},]
    }, {
        id: 7,
        category: '钥匙',
        child: [{id: 1, category: "零号大坝"}, {id: 2, category: "长弓溪谷"}, {id: 3, category: "巴克什"}, {
            id: 4,
            category: "航天基地"
        },]
    },

    ];


    return Response.json(
        {
            code: 0,
            msg: "ok",
            data: category
        }
    )
}
