//这里填入你获取的application_id
var str_application_id = '';
//输入后自动加载玩家ID模糊查找的方法
function autoGetAccount_id() {
    var str_area = $("#area").val();
    var str_search_Nickname = $("#searchNickname").val();
    var json_account_id_list = getAccount_id(str_search_Nickname, str_area);
    $("#searchNicknamedataList").empty();
    for (var i = 0; i < json_account_id_list.data.length; i++) {
        $("#searchNicknamedataList").append("<option>" + json_account_id_list.data[i].nickname + "</option>");　　
    }
}
//获得ID
function getAccount_id(str_nickname, str_area) {
    var json_returnValue;
    $.ajax({
        timeout: 3000,
        url: "https://api.worldofwarships." + str_area + "/wows/account/list/",
        context: document.body,
        async: false,
        type: "post",
        data: {
            application_id: str_application_id,
            search: str_nickname
        },
        success: function(parm) {
            json_returnValue = parm;
        }
    });
    return json_returnValue;
}
//获得基本数据
function getPlayerDate(str_account_id, str_area) {
    var json_returnValue;
    $.ajax({
        timeout: 3000,
        url: "https://api.worldofwarships." + str_area + "/wows/account/info/",
        context: document.body,
        async: false,
        type: "post",
        data: {
            application_id: str_application_id,
            account_id: str_account_id
        },
        success: function(parm) {
            json_returnValue = parm;
        }
    });
    return json_returnValue;
}
//获得战舰数据
function getWarshipData(str_account_id, str_area) {
    var json_returnValue;
    $.ajax({
        timeout: 3000,
        url: "https://api.worldofwarships." + str_area + "/wows/ships/stats/",
        context: document.body,
        async: false,
        type: "post",
        data: {
            application_id: str_application_id,
            account_id: str_account_id
        },
        success: function(parm) {
            json_returnValue = parm;
        }
    });
    return json_returnValue;
}
//主要的查询方法
function search() {
    var str_area; // 选择的服务器
    var str_search_Nickname; // 搜索的名字,毛子API接口不区分大小写
    var str_account_id; //搜索出来的WGID
    var json_account_id_list = []; //
    var json_playerData = []; //玩家基础数据json包
    var json_warships = []; //玩家战舰json数据包(毛子服务器版本)
    var json_showWarship = []; //玩家战舰json数据包(渲染版本)
    var int_all_pvp_match; //游戏总场次
    str_area = $("#area").val();
    str_search_Nickname = $("#searchNickname").val();
    if (str_search_Nickname == "") {
        layer.alert("ID不能为空", { icon: 2 });
        return false;
    }

    json_account_id_list = getAccount_id(str_search_Nickname, str_area);
    if (json_account_id_list.data.length == 0) {
        layer.alert(str_search_Nickname + "不存在,请重新输入", { icon: 2 });
        return false;
    }
    json_warships = getWarshipData(str_account_id, str_area);
    str_account_id = json_account_id_list.data[0].account_id
    json_playerData = getPlayerDate(str_account_id, str_area);
    $("#last_battle_time").html(timestampToTime(json_playerData.data[str_account_id].last_battle_time)); //最后战斗时间
    $("#account_id").html(json_playerData.data[str_account_id].account_id); //WGID
    $("#leveling_tier").html(json_playerData.data[str_account_id].leveling_tier); //玩家等级
    $("#created_at").html(timestampToTime(json_playerData.data[str_account_id].created_at)); //创建时间
    $("#leveling_points").html(json_playerData.data[str_account_id].leveling_points); //服务器分数(意义不明)
    $("#updated_at").html(timestampToTime(json_playerData.data[str_account_id].updated_at)); //最后更新时间
    $("#logout_at").html(timestampToTime(json_playerData.data[str_account_id].logout_at)); //登出时间
    // 随机战斗的总次数
    int_all_pvp_match = json_playerData.data[str_account_id].statistics.pvp.losses + json_playerData.data[str_account_id].statistics.pvp.wins + json_playerData.data[str_account_id].statistics.pvp.draws;
    //总胜率
    $("#statistics\\.pvp\\.wins\\%").html(toPercent(json_playerData.data[str_account_id].statistics.pvp.wins / int_all_pvp_match));
    $("#statistics\\.pvp\\.wins").html(json_playerData.data[str_account_id].statistics.pvp.wins); //总胜场
    $("#statistics\\.pvp\\.losses").html(json_playerData.data[str_account_id].statistics.pvp.losses); //总败场
    $("#statistics\\.pvp\\.draws").html(json_playerData.data[str_account_id].statistics.pvp.draws);
    $("#statistics\\.pvp\\.xp_average").html((json_playerData.data[str_account_id].statistics.pvp.xp / int_all_pvp_match).toFixed(0)); //场均经验
    $("#statistics\\.pvp\\.damage_dealt_average").html((json_playerData.data[str_account_id].statistics.pvp.damage_dealt / int_all_pvp_match).toFixed(0));
    $("#statistics\\.pvp\\.frags_average").html((json_playerData.data[str_account_id].statistics.pvp.frags / int_all_pvp_match).toFixed(2));
    //主炮命中率
    $("#statistics\\.pvp\\.shots\\%").html(toPercent(json_playerData.data[str_account_id].statistics.pvp.main_battery.hits / json_playerData.data[str_account_id].statistics.pvp.main_battery.shots));
    //鱼雷命中率
    $("#statistics\\.pvp\\.torpedoes\\.shots\\%").html(toPercent(json_playerData.data[str_account_id].statistics.pvp.torpedoes.hits / json_playerData.data[str_account_id].statistics.pvp.torpedoes.shots));
    //场均飞机击落数
    $("#statistics\\.pvp\\.planes_killed_average").html((json_playerData.data[str_account_id].statistics.pvp.planes_killed / int_all_pvp_match).toFixed(2));
    $("#statistics\\.pvp\\.ships_spotted_average").html((json_playerData.data[str_account_id].statistics.pvp.ships_spotted / int_all_pvp_match).toFixed(2));
    $("#statistics\\.pvp\\.art_agro\\%").html((json_playerData.data[str_account_id].statistics.pvp.art_agro / int_all_pvp_match).toFixed(0));
    // 获取战舰数据
    json_warships = getWarshipData(str_account_id, str_area);
    for (var i = 0; i < json_warships.data[str_account_id].length; i++) {
        //战舰ID[回头要翻译成名称]
        var ship_id = json_warships.data[str_account_id][i].ship_id; //战舰ID
        var shipName;
        var jValue;
        try {
            jValue = zhtw.data[ship_id];
            shipName = jValue.name;
        } catch (error) {
            // if (jValue == null) {
            //     shipName = "*";
            // } else {
            console.log(ship_id + ',');
            shipName = ship_id;
            // }

        }
        var wins = json_warships.data[str_account_id][i].pvp.wins; //胜利场次
        var lose = json_warships.data[str_account_id][i].pvp.losses; //失败场次
        var darw = json_warships.data[str_account_id][i].pvp.draws; //平局场次 
        var all = wins + lose + darw; //总场次
        if (all != 0) {
            var wins_per = toPercent(wins / all); //胜率

            var main_battery_hits = json_warships.data[str_account_id][i].pvp.main_battery.hits; //主炮命中数
            var main_battery_shots = json_warships.data[str_account_id][i].pvp.main_battery.shots; //主炮发射数
            var main_battery_per = toPercent(main_battery_hits / main_battery_shots); //主炮命中率

            var second_battery_hits = json_warships.data[str_account_id][i].pvp.second_battery.hits; //副炮命中数
            var second_battery_shots = json_warships.data[str_account_id][i].pvp.second_battery.shots; //副炮发射数
            var second_battery_per = toPercent(second_battery_hits / second_battery_shots); //副炮命中率

            var torpedoes_hits = json_warships.data[str_account_id][i].pvp.torpedoes.hits; //鱼雷命中数
            var torpedoes_shots = json_warships.data[str_account_id][i].pvp.torpedoes.shots; //鱼雷发射数
            var torpedoes_per = toPercent(torpedoes_hits / torpedoes_shots); //鱼雷命中率

            var frags = json_warships.data[str_account_id][i].pvp.frags; //随机击毁数
            var frags_average = (frags / all).toFixed(2); //场均击毁数

            var damage_dealt = json_warships.data[str_account_id][i].pvp.damage_dealt; //伤害总数
            var damage_dealt_average = (damage_dealt / all).toFixed(2); //场均伤害

            var ships_spotted = json_warships.data[str_account_id][i].pvp.ships_spotted; //点亮数目
            var ships_spotted_average = (ships_spotted / all).toFixed(2); //场均点亮数目

            var damage_scouting = json_warships.data[str_account_id][i].pvp.damage_scouting; //点亮伤害
            var damage_scouting_avergae = (damage_scouting / all).toFixed(2); //场均点亮伤害

            var planes_killed = json_warships.data[str_account_id][i].pvp.planes_killed; //击落飞机数
            var planes_killed_average = (planes_killed / all).toFixed(2); //场均击落飞机

            var team_dropped_capture_points = json_warships.data[str_account_id][i].pvp.team_dropped_capture_points; //队伍防御总数
            var dropped_capture_points = json_warships.data[str_account_id][i].pvp.dropped_capture_points; //个人防御数
            var dropped_capture_points_average = (dropped_capture_points / team_dropped_capture_points).toFixed(2); //防御系数

            var team_capture_points = json_warships.data[str_account_id][i].pvp.team_capture_points; //队伍占领总数
            var capture_points = json_warships.data[str_account_id][i].pvp.capture_points; //个人占领数
            var capture_points_average = (capture_points / team_capture_points).toFixed(2); //占领系数

            var xp = json_warships.data[str_account_id][i].pvp.xp; //总计经验
            var xp_average = (xp / all).toFixed(2); //场均经验

            var score = 0;

            var tmp_json = {
                "shipName": shipName,
                "all": all,
                "wins_per": wins_per,
                "main_battery_per": main_battery_per,
                "second_battery_per": second_battery_per,
                "torpedoes_per": torpedoes_per,
                "frags_average": frags_average,
                "damage_dealt_average": damage_dealt_average,
                "ships_spotted_average": ships_spotted_average,
                "damage_scouting_avergae": damage_scouting_avergae,
                "planes_killed_average": planes_killed_average,
                "dropped_capture_points_average": dropped_capture_points_average,
                "capture_points_average": capture_points_average,
                "xp_average": xp_average,
                "score": score

            };
            json_showWarship.push(tmp_json);
        }
    }
    var table = layui.table;

    //执行渲染
    table.render({
        title: "单场平均(以下数据均为单场平均)",
        elem: '#demo',
        cols: [
            [
                { field: 'shipName', title: '战舰', sort: true },
                { field: 'all', title: '场次', width: 80, sort: true },
                { field: 'wins_per', title: '胜率', width: 80, sort: true },
                { field: 'main_battery_per', title: '主炮命中', width: 95, sort: true },
                { field: 'second_battery_per', title: '副炮命中', width: 95, sort: true },
                { field: 'torpedoes_per', title: '鱼雷命中', width: 95, sort: true },
                { field: 'frags_average', title: '场均击毁', width: 95, sort: true },
                { field: 'damage_dealt_average', title: '场均伤害', sort: true },
                { field: 'ships_spotted_average', title: '场均点亮', width: 95, sort: true },
                { field: 'damage_scouting_avergae', title: '场均点亮伤害', sort: true },
                { field: 'planes_killed_average', title: '场均飞机击落', sort: true },
                { field: 'dropped_capture_points_average', title: '防御系数', sort: true },
                { field: 'capture_points_average', title: '占领系数', sort: true },
                { field: 'xp_average', title: '场均经验', sort: true },
                { field: 'score', title: '评分', sort: true }

            ]
        ],
        data: json_showWarship,
        even: true,
        size: 'sm',
        limit: 1000000000000
    });
}




//时间戳转换时间显示
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y + M + D + h + m + s;
}
//转换百分比
function toPercent(point) {
    var str = Number(point * 100).toFixed(2);
    str += "%";
    return str;
}
//百分比转换小数
function toPoint(percent) {
    var str = percent.replace("%", "");
    str = str / 100;
    return str;
}