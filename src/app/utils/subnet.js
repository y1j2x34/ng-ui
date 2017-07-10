(function(root, factory) {
    "use strict";
    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("../supports/Class"));
    } else if (define && define.amd) {
        define(["../supports/Class"], factory);
    } else {
        root.Subnet = factory(root.Class);
    }
})(this, function(Class) {
    "use strict";

    var IP_ADDRESS_FORMAT = "(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})";
    var SLASH_FORMAT = IP_ADDRESS_FORMAT + "/(\\d{1,3})";
    var IP_ADDRESS_REGEX = new RegExp(IP_ADDRESS_FORMAT);
    var CIDR_REGEX = new RegExp(SLASH_FORMAT);

    return Class.create({
        name: "Subnet",
        statics:{
            isValidCidrBlock: isValidCidrBlock,
            validationCidrBlock: validationCidrBlock
        },
        init:function(self, cidr, inclusiveHostCount){
            if (!isValidCidrBlock(cidr)) {
                throw new Error("Invalid cidr block");
            }
            var result = calculate(cidr);
            for (var key in result) {
                self[key] = result[key];
            }
            self.inclusiveHostCount = inclusiveHostCount === undefined ? true : !!inclusiveHostCount;
        },
        isInRange: isInRange,
        getNetmask: getNetmask,
        getBroadcastAddress: getBroadcastAddress,
        getNetworkAddress: getNetworkAddress,
        getLowAddress: getLowAddress,
        getHighAddress: getHighAddress,
        getCidrSignature: getCidrSignature,
        getAddressCount: getAddressCount,
        toString: toString
    });
    /**
     * 校验网段是否合法
     * @param  {String}  cidr 网段， 0.0.0.0/0
     * @return {Boolean}      合法： true, 非法： false
     * @throws Error if mask out of range
     */
    function isValidCidrBlock(cidr) {
        if (typeof cidr !== "string") {
            return false;
        }
        var result = validationCidrBlock(cidr);
        if (!result && result.message) {
            throw new Error(result.message);
        }
        return result.valid;
    }
    /**
     * 验证cidrblock, 返回错误详情
     * @param  {String} cidrblock
     * @return {Object}
     */
    function validationCidrBlock(cidrblock) {
        if (typeof cidrblock !== "string") {
            return invalid();
        }
        var matches = CIDR_REGEX.exec(cidrblock);
        if (!matches || matches.length !== 6) {
            return invalid();
        }
        var address = toArray(matchAddress(matches));
        var cidrPart = parseInt(matches[5]);
        if (isNaN(cidrPart) || cidrPart < 0 || cidrPart > 32) {
            return message(false, 4, "cidrPart [" + cidrPart + "] not in range [0, 32]");
        }

        var rtc = 256 >> (cidrPart % 8);

        var clazz = cidrPart >> 3;

        if (rtc !== 256 && address[clazz] % rtc !== 0) {
            return message(false, clazz);
        }

        var pos = rtc === 256 ? clazz : clazz + 1;
        for (var i = pos; i < 4; i++) {
            if (address[i] !== 0) {
                return message(false, i);
            }
        }

        return message(true, -1);

        function invalid() {
            return message(false, -1);
        }

        function message(valid, part, message) {
            return {
                valid: valid,
                part: part,
                message: message
            };
        }
    }

    function toString(self) {
        return [
            "\tCIDR Signatur:\t[" + self.getCidrSignature() + "]",
            "\tNetmask:\t[" + self.getNetmask() + "]",
            "\tNetwork:\t[" + self.getNetworkAddress() + "]",
            "\tBroadcast:\t[" + self.getBroadcastAddress() + "]",
            "\tFirst Address:\t[" + self.getLowAddress() + "]",
            "\tLast Address:\t[" + self.getHighAddress() + "]",
            "\t# Addresses:\t[" + self.getAddressCount() + "]"
        ].join("\n");
    }

    function low(self) {
        return self.inclusiveHostCount ? self.network :
            self.broadcast - self.network > 1 ? self.network + 1 : 0;
    }

    function high(self) {
        return self.inclusiveHostCount ? self.broadcast :
            self.broadcast - self.network > 1 ? self.broadcast - 1 : 0;
    }
    /**
     * 检查是否在CIDR范围内
     * @param  {Subnet}  self
     * @param  {number|string}  address IP地址（整数或字符串形式）
     * @return {Boolean}
     */
    function isInRange(self, address) {
        if (typeof address === "string") {
            address = toInteger(address);
        }
        var diff = address - low();
        return diff >= 0 && diff <= high(self) - low(self);
    }

    function getAddressCount(self) {
        var count = self.broadcast - self.network + (self.inclusiveHostCount ? 1 : -1);
        return count < 0 ? 0 : count;
    }

    /**
     * 广播地址
     * @param  {[type]} self [description]
     * @return {[type]}      [description]
     */
    function getBroadcastAddress(self) {
        return format(toArray(self.broadcast));
    }

    function getNetworkAddress(self) {
        return format(toArray(self.network));
    }
    /**
     * 掩码地址
     * @param  {Subnet} self [description]
     * @return {String}      [description]
     */
    function getNetmask(self) {
        return format(toArray(self.netmask));
    }
    /**
     * 最小IP地址（点分）
     * @param  {Subnet} self
     * @return {String}      点分数字IP地址
     */
    function getLowAddress(self) {
        return format(toArray(low(self)));
    }
    /**
     * 最大IP地址（点分）
     * @param  {Subnet} self
     * @return {String}  点分数字IP地址， 返回"0.0.0.0"可能是因为没有合法地址
     */
    function getHighAddress(self) {
        return format(toArray(high(self)));
    }


    function getCidrSignature(self) {
        return format(toArray(self.address)) + "/" + pop(self.getNetmask());
    }

    function pop(x) {
        x = x - ((x >>> 1) & 0x55555555);
        x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
        x = (x + (x >>> 4)) & 0x0F0F0F0F;
        x = x + (x >>> 8);
        x = x + (x >>> 16);
        return x & 0x0000003F;
    }

    /**
     * 数字形式的IP转为数组
     * @param  {Number} val 数字形式IP地址
     * @return {Array}
     */
    function toArray(val) {
        var ret = [0, 0, 0, 0];
        for (var i = 3; i >= 0; i--) {
            ret[i] |= (val >>> 8 * (3 - i)) & 0xff;
        }
        return ret;
    }

    /**
     * 转为以点分隔的字符串
     * @param  {Array} octets 数字数组
     * @return {String}
     */
    function format(octets) {
        return octets.join(".");
    }

    function calculate(mask) {
        var matches = CIDR_REGEX.exec(mask);
        if (matches) {
            var address = matchAddress(matches);

            var cidrPart = rangeCheck(parseInt(matches[5]), 0, 32);

            var netmask = 0;

            for (var j = 0; j < cidrPart; ++j) {
                netmask |= 1 << 31 - j;
            }
            var network = address & netmask;

            var broadcast = network | ~netmask;

            return {
                address: address,
                network: network,
                netmask: netmask,
                broadcast: broadcast
            };

        } else {
            throw new Error("Could not parse [" + mask + "]");
        }
    }

    /**
     * IP地址转为整数
     * @param  {String} address IP地址
     * @return {Number}         整数形式
     */
    function toInteger(address) {
        var matches = IP_ADDRESS_REGEX.exec(address);
        if (matches) {
            return matchAddress(matches);
        } else {
            throw new Error("Could not parse [" + address + "]");
        }
    }
    /**
     *
     * @param  {array} matches IP 地址正则解析结果
     * @return {Number}         整数形式的IP
     */
    function matchAddress(matches) {
        var addr = 0;
        for (var i = 1; i <= 4; i++) {
            var n = rangeCheck(parseInt(matches[i]), 0, 255);
            addr |= (n & 0xff) << 8 * (4 - i);
        }
        return addr;
    }

    function rangeCheck(value, begin, end) {
        if (value >= begin && value <= end) {
            return value;
        }
        throw new Error("value [" + value + "] not in range ( " + begin + " , " + end + " )");
    }
});