import localFont from "next/font/local";
import "./globals.css";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import Link from "next/link";
import React from 'react';

const geistSans = localFont({
    src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900",
});

export const metadata = {
    title: "跳蚤市场 - 三角洲行动",
    description: "三角洲行动交易行、三角洲行动交易行价格表、跳蚤价格监控、图表、价格历史、工艺品、btc农场利润、任务、地图、密码、彩蛋密码门、零号大坝密码、长弓溪谷密码、巴克什密码、航天基地密码",
    keywords: "三角洲行动交易行，三角洲行动交易行价格市场，三角洲行动，三角洲行动今日密码，彩蛋密码门，零号大坝密码，长弓溪谷密码，巴克什密码，航天基地密码，市场，跳蚤市场，价格，价格监控，价格图标，交易，价格历史，图表，api，任务，地图，费用，工艺品，改枪码，好用的改枪码，物资地图"
};

export default function RootLayout({children}) {
    return (<html lang="en">
    <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    <AntdRegistry>
        {children}
    </AntdRegistry>
    <footer className="text-center text-sm w-full bottom-0 absolute mt-5 " style={{color: '#5f5e56'}}>
        <div className="container mx-auto py-1 ">
            <div className="">
                所有网站以及数据服务都是由一个人设计、开发和维护的 -
                <Link className="sub text-blue-400 hover:underline"
                      href="https://github.com/K12f/df-dicuss"
                      target="_blank"
                      rel="noopener noreferrer"
                >
                    k12f
                </Link>
            </div>
            <div>
                <Link className="sub text-blue-400 hover:underline"
                      href="https://github.com/K12f/df-dicuss/discussions"
                      target="_blank"
                      rel="noopener noreferrer"
                >
                    意见提交处
                </Link>
            </div>
            <div>
                <Link className="sub text-blue-400 hover:underline"
                      href="https://github.com/K12f/df-dicuss/releases/download/v1.0.0/df-market.msi"
                      target="_blank"
                      rel="noopener noreferrer"
                >
                    pc端桌面应用
                </Link>
            </div>
            <div>
                游戏内容和材料的商标所有版权归三角洲行动游戏方及其子公司所有。
            </div>
        </div>
    </footer>
    </body>
    </html>);
}
