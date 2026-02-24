const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 封装一个读取 db.json 的助手函数
const getDbData = () => {
    const data = fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8');
    return JSON.parse(data);
};

// 获取酒店列表接口 (GET /api/hotel)
router.get('/', (req, res) => {
    try {
        const db = getDbData();
        console.log('🔍 数据库加载成功，hotels数组长度:', db.hotels ? db.hotels.length : 'undefined');
        let list = [...db.hotels];

        // 筛选参数
        const { sort, star, keyword, minPrice, maxPrice, tag, province, city, checkin, checkout } = req.query;

        console.log('========== 后端接收到的搜索参数 ==========');
        console.log('province:', province, 'city:', city, 'keyword:', keyword);
        console.log('star:', star, 'tag:', tag);
        console.log('minPrice:', minPrice, 'maxPrice:', maxPrice);
        console.log('初始酒店数量:', list.length);
        if (list.length > 0) {
            console.log('第一个酒店示例:', { id: list[0].id, nameCn: list[0].nameCn, address: list[0].address });
        }

        // 省份到主要城市映射（用于省份选择能匹配到省内城市）
        const provinceCities = {
            '北京': ['北京'],
            '天津': ['天津'],
            '上海': ['上海'],
            '重庆': ['重庆'],
            '河北': ['石家庄','唐山','秦皇岛','邯郸','邢台','保定','张家口','承德','沧州','廊坊','衡水'],
            '山西': ['太原','大同','阳泉','长治','晋城','朔州','晋中','运城','忻州','临汾','吕梁'],
            '辽宁': ['沈阳','大连','鞍山','抚顺','本溪','丹东','锦州','营口','阜新','辽阳','盘锦','铁岭','朝阳','葫芦岛'],
            '吉林': ['长春','吉林','四平','辽源','通化','白山','松原','白城','延边'],
            '黑龙江': ['哈尔滨','齐齐哈尔','牡丹江','佳木斯','大庆','鸡西','双鸭山','伊春','鹤岗','七台河','黑河','绥化'],
            '江苏': ['南京','无锡','徐州','常州','苏州','南通','连云港','淮安','盐城','扬州','镇江','泰州','宿迁'],
            '浙江': ['杭州','宁波','温州','嘉兴','湖州','绍兴','金华','衢州','舟山','台州','丽水'],
            '安徽': ['合肥','芜湖','蚌埠','淮南','马鞍山','淮北','铜陵','安庆','黄山','滁州','阜阳','宿州','巢湖','六安','亳州','池州','宣城'],
            '福建': ['福州','厦门','莆田','三明','泉州','漳州','南平','龙岩','宁德'],
            '江西': ['南昌','景德镇','九江','上饶','抚州','赣州','吉安','宜春','鹰潭','萍乡','新余'],
            '山东': ['济南','青岛','淄博','枣庄','东营','烟台','潍坊','济宁','泰安','威海','日照','莱芜','临沂','德州','聊城','滨州','菏泽'],
            '河南': ['郑州','开封','洛阳','平顶山','安阳','鹤壁','新乡','焦作','濮阳','许昌','漯河','三门峡','南阳','商丘','信阳','周口','驻马店','济源'],
            '湖北': ['武汉','黄石','十堰','荆州','宜昌','襄阳','鄂州','荆门','孝感','黄冈','咸宁','随州','恩施'],
            '湖南': ['长沙','株洲','湘潭','衡阳','邵阳','岳阳','常德','张家界','益阳','郴州','永州','怀化','娄底','湘西'],
            '广东': ['广州','深圳','珠海','汕头','佛山','韶关','湛江','肇庆','江门','茂名','惠州','梅州','汕尾','阳江','清远','东莞','中山','潮州','揭阳','云浮'],
            '广西': ['南宁','柳州','桂林','梧州','北海','防城港','钦州','贵港','玉林','百色','河池','来宾','崇左'],
            '海南': ['海口','三亚','三沙','儋州'],
            '四川': ['成都','绵阳','自贡','攀枝花','泸州','德阳','遂宁','内江','乐山','南充','眉山','宜宾','广安','达州','雅安','巴中','资阳'],
            '贵州': ['贵阳','六盘水','遵义','安顺','铜仁','毕节','黔东南','黔南','黔西南'],
            '云南': ['昆明','大理','丽江','曲靖','玉溪','昭通','保山','临沧','红河','文山','普洱','德宏','怒江','迪庆','楚雄','西双版纳'],
            '西藏': ['拉萨','日喀则','昌都','林芝','山南','那曲','阿里'],
            '陕西': ['西安','咸阳','宝鸡','渭南','汉中','安康','商洛','榆林','铜川'],
            '甘肃': ['兰州','嘉峪关','金昌','白银','天水','武威','张掖','平凉','酒泉','庆阳','定西','陇南'],
            '青海': ['西宁','海东','海北','黄南','海南','果洛','玉树','海西'],
            '宁夏': ['银川','石嘴山','吴忠','固原','中卫'],
            '新疆': ['乌鲁木齐','克拉玛依','石河子','喀什','和田','阿克苏','巴音郭楞','昌吉','吐鲁番','哈密','博尔塔拉','伊犁','克孜勒苏','塔城','阿勒泰'],
            '香港': ['香港'],
            '澳门': ['澳门'],
            '台湾': ['台北','高雄','台中','台南','桃园']
        };

        // 星级筛选
        if (star) {
            const beforeLength = list.length;
            list = list.filter(h => h.star === parseInt(star));
            console.log(`⭐ 星级筛选 (star=${star}): ${beforeLength} -> ${list.length}`);
        }

        // 关键词、地址、省份匹配逻辑改为并集，并标记匹配类型
        let hasSearchConditions = false;
        const provinceLower = province && province.trim() ? province.trim().toLowerCase() : null;
        const provinceCitiesList = provinceLower ? (provinceCities[province.trim()] || []).map(c => c.toLowerCase()) : [];
        const cityLower = city && city.trim() ? city.trim().toLowerCase() : null;
        const kwList = keyword && keyword.trim() 
            ? keyword.trim().toLowerCase().split(/[-—、\s]+/).map(s => s.trim()).filter(Boolean)
            : [];

        if (provinceLower || cityLower || kwList.length > 0) {
            hasSearchConditions = true;
            
            // 为每个酒店标记匹配类型
            list = list.map(h => {
                const address = (h.address || '').toLowerCase();
                const nameCn = (h.nameCn || '').toLowerCase();
                const nameEn = (h.nameEn || '').toLowerCase();
                const tags = Array.isArray(h.tags) ? h.tags.map(t => t.toLowerCase()) : [];

                // 检查省份匹配
                let provinceMatch = false;
                if (provinceLower) {
                    if (address.includes(provinceLower)) {
                        provinceMatch = true;
                    } else {
                        for (const c of provinceCitiesList) {
                            if (address.includes(c)) {
                                provinceMatch = true;
                                break;
                            }
                        }
                    }
                }

                // 检查地址匹配（city参数）
                const addressMatch = cityLower ? address.includes(cityLower) : false;

                // 检查关键词匹配（名称或标签）
                const keywordMatch = kwList.length > 0 ? kwList.some(kw =>
                    nameCn.includes(kw) ||
                    nameEn.includes(kw) ||
                    tags.some(t => t.includes(kw))
                ) : false;

                // 计算匹配得分（用于优先级排序）
                // province匹配+1，city匹配+1，keyword匹配+1
                let matchScore = 0;
                if (provinceLower && provinceMatch) matchScore += 1;
                if (cityLower && addressMatch) matchScore += 1;
                if (kwList.length > 0 && keywordMatch) matchScore += 1;

                // 如果有province或city条件，则只计算地址相关的匹配
                // 如果仅有keyword，则keyword匹配就算高优先级
                let matchPriority = 0;
                if (provinceLower || cityLower) {
                    // 有地址条件时，优先级按：地址+关键词 > 仅关键词 > 仅地址 > 都不匹配
                    if ((provinceMatch || addressMatch) && keywordMatch) matchPriority = 3; // 地址+关键词都匹配
                    else if (keywordMatch) matchPriority = 2; // 仅关键词匹配
                    else if (provinceMatch || addressMatch) matchPriority = 1; // 仅地址匹配
                    else matchPriority = 0; // 都不匹配
                } else if (kwList.length > 0) {
                    // 仅有关键词时
                    if (keywordMatch) matchPriority = 3;
                    else matchPriority = 0;
                }
    
                return { ...h, _matchPriority: matchPriority, _matchScore: matchScore };
            });

            // 按优先级排序（优先级高的在前）
            list.sort((a, b) => b._matchPriority - a._matchPriority);
            
            // 调试：输出排序后前10个酒店的信息
            console.log('优先级排序后，前10个酒店的信息:');
            list.slice(0, 10).forEach((h, i) => {
                console.log(`  ${i+1}. ${h.nameCn} - 地址: ${h.address} - 优先级: ${h._matchPriority}`);
            });
        }

        // 标签筛选（只返回包含该tag的酒店）
        if (tag && tag.trim()) {
            const beforeLength = list.length;
            const tagLower = tag.trim().toLowerCase();
            list = list.filter(h => Array.isArray(h.tags) && h.tags.some(t => t.toLowerCase() === tagLower));
            console.log(`🏷️ 标签筛选 (tag=${tag}): ${beforeLength} -> ${list.length}`);
        }

        // 日期筛选（基础可用性判断）：若同时传入 checkin 和 checkout，则只保留存在可预订房型（count>0）的酒店
        if (checkin && checkout) {
            const beforeLength = list.length;
            console.log(`📅 日期筛选前酒店数: ${beforeLength}, checkin=${checkin}, checkout=${checkout}`);
            list = list.filter(h => {
                const hasRooms = Array.isArray(h.rooms) && h.rooms.some(r => (r.count || 0) > 0);
                if (!hasRooms) {
                    console.log(`  ❌ 过滤掉: ${h.nameCn} - rooms:`, h.rooms);
                }
                return hasRooms;
            });
            console.log(`📅 日期筛选 (checkin=${checkin}): ${beforeLength} -> ${list.length}`);
        }

        // 价格区间筛选（房型最低价）
        if (minPrice || maxPrice) {
            const beforeLength = list.length;
            list = list.filter(h => {
                const minRoomPrice = h.rooms && h.rooms.length > 0 ? Math.min(...h.rooms.map(r => r.price)) : 0;
                if (minPrice && minRoomPrice < parseInt(minPrice)) return false;
                if (maxPrice && minRoomPrice > parseInt(maxPrice)) return false;
                return true;
            });
            console.log(`💰 价格筛选 (min=${minPrice}, max=${maxPrice}): ${beforeLength} -> ${list.length}`);
        }

        // 排序
        if (sort === 'price_asc') {
            list.sort((a, b) => a.rooms[0].price - b.rooms[0].price);
        } else if (sort === 'rating_desc') {
            list.sort((a, b) => b.rating - a.rating);
        }

        // 分页
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const total = list.length;
        const pagedList = list.slice((page - 1) * pageSize, page * pageSize);

        console.log('分页前总数:', total);
        console.log('分页参数 - page:', page, 'pageSize:', pageSize);
        console.log('分页后返回数量:', pagedList.length);
        console.log('========================================');

        // 移除临时的匹配优先级字段
        const cleanedList = pagedList.map(h => {
            const { _matchPriority, _matchScore, ...rest } = h;
            return rest;
        });

        res.json({
            success: true,
            data: cleanedList,
            total: total,
            hasSearchConditions: hasSearchConditions
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "服务器内部错误" });
    }
});

// 2. 获取酒店详情接口 (GET /api/hotel/:id)
router.get('/:id', (req, res) => {
    const db = getDbData();
    const hotel = db.hotels.find(h => h.id === parseInt(req.params.id));
    if (hotel) {
        res.json({ success: true, data: hotel });
    } else {
        res.status(404).json({ success: false, message: "酒店不存在" });
    }
});

module.exports = router;