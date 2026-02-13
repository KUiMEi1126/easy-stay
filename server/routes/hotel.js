const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 封装一个读取 db.json 的助手函数
const getDbData = () => {
    const data = fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8');
    return JSON.parse(data);
};

// 1. 获取酒店列表接口 (GET /api/hotel)
router.get('/', (req, res) => {
    try {
        const db = getDbData();
        let list = [...db.hotels];

        // 筛选参数
        const { sort, star, keyword, minPrice, maxPrice, tag, province, checkin, checkout } = req.query;

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
            list = list.filter(h => h.star === parseInt(star));
        }

        // 关键词筛选（支持nameCn、nameEn、address、tags）
        if (keyword && keyword.trim()) {
            const kw = keyword.trim().toLowerCase();
            list = list.filter(h =>
                (h.nameCn && h.nameCn.toLowerCase().includes(kw)) ||
                (h.nameEn && h.nameEn.toLowerCase().includes(kw)) ||
                (h.address && h.address.toLowerCase().includes(kw)) ||
                (Array.isArray(h.tags) && h.tags.some(t => t.toLowerCase().includes(kw)))
            );
        }

        // 标签筛选（只返回包含该tag的酒店）
        if (tag && tag.trim()) {
            list = list.filter(h => Array.isArray(h.tags) && h.tags.includes(tag));
        }

        // 日期筛选（基础可用性判断）：若同时传入 checkin 和 checkout，则只保留存在可预订房型（count>0）的酒店
        if (checkin && checkout) {
            list = list.filter(h => Array.isArray(h.rooms) && h.rooms.some(r => (r.count || 0) > 0));
        }

        // 价格区间筛选（房型最低价） - 在省份优先逻辑之前应用，保证 matched/others 都是基于已过滤数据
        if (minPrice || maxPrice) {
            list = list.filter(h => {
                const minRoomPrice = h.rooms && h.rooms.length > 0 ? Math.min(...h.rooms.map(r => r.price)) : 0;
                if (minPrice && minRoomPrice < parseInt(minPrice)) return false;
                if (maxPrice && minRoomPrice > parseInt(maxPrice)) return false;
                return true;
            });
        }

        // 省份匹配优先逻辑：将匹配省份/省内城市的酒店判为 matched，其他为 others
        let matched = [];
        let others = [];
        if (province && province.trim()) {
            const prov = province.trim();
            const cities = provinceCities[prov] || [];
            for (const h of list) {
                const addr = (h.address || '').toString();
                let isMatch = false;
                if (addr) {
                    if (addr.includes(prov)) isMatch = true;
                    for (const c of cities) {
                        if (addr.includes(c)) { isMatch = true; break; }
                    }
                }
                if (isMatch) matched.push(h); else others.push(h);
            }
            // 如果有匹配项，则按优先级合并（matched 在前），但不要在此处直接截断列表——分页时会特殊处理
            if (matched.length > 0) {
                list = [...matched, ...others];
            }
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
        let pagedList = [];

        // 如果传了 province 且存在 matched/others，则对第一页做混合显示：
        // 保证第一页既展示优先匹配的酒店，也至少包含若干其他城市酒店以避免只显示单一省份
        if (province && province.trim() && matched.length > 0) {
            if (page === 1) {
                const reserveOthers = Math.min(2, others.length); // 在第一页保留 0-2 个非匹配酒店作为示例
                const takeMatched = Math.min(matched.length, pageSize - reserveOthers);
                const takeOthers = pageSize - takeMatched;
                pagedList = [...matched.slice(0, takeMatched), ...others.slice(0, takeOthers)];
            } else {
                // 后续页面按合并后顺序继续分页
                const fullList = [...matched, ...others];
                pagedList = fullList.slice((page - 1) * pageSize, page * pageSize);
            }
        } else {
            pagedList = list.slice((page - 1) * pageSize, page * pageSize);
        }

        res.json({
            success: true,
            data: pagedList,
            total: total
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