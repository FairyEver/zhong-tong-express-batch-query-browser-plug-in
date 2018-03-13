import domStr from './dom'

import Csv from '../lib/csv'
import ExportCsv from '../lib/csvExport'
import search from './search'

export default class X {
    constructor () {
        // 重新注册事件
        this.rebind()
        // 在页面上添加面板
        $('#ajaxdata').before($(domStr))
        // 需要查询的列表
        this.ids = [
            '630644632616',
            '630644632566',
            '630644632458',
            '630644632433',
            '630644632340',
            '630644632256',
            '630644625936',
            '630644625861',
            '630644625714',
            '630644619477',
            '630644619460',
            '630644619452'
        ]
        // 已经完成的
        this.finish = []
        // 注册
        this.cache()
        this.register()
        // 开发测试
        // this.startSearch()
    }
    // 重新绑定事件
    rebind () {
        $(document).off("click", ".menu li").on("click", ".menu li", function () {
            // 临时禁用这个按钮
            $(this).find("button").attr("disabled", "disabled").delay(100).animate({ disabled: '' });
            // 在 ztoAjax 中用到
            var index = $(this).index();
            // 单号 类似于 630644632616_0 这个数据是绑定在按钮上的
            var bill = $(this).find("button").attr("data-bill");
            // 忽略这两个按钮
            if ($(this).find("button").html() === "登记所有查询记录" || $(this).find("button").html() === "单号轨迹") {
                return
            }
            // 需要处理事件的按钮
            if (!$(this).hasClass("curr")) {
                // 从这个按钮上获取数据
                var url = $(this).find("button").attr("data-url");
                var id = $(this).find("button").attr("data-id");
                var text = $(this).find("button").text().trim();
                var queryParms = getUrlParmas(url);
                var currentButton = this;
                // 给我刷！
                const billQueryPreauthFn = () => {
                    return new Promise((resolve, reject) => {
                        let ticket = ''
                        const doIt = () => {
                            $('#log').text(`尝试获取凭证 ${queryParms.id}`)
                            ztosec.billQueryPreauth({
                                bill: queryParms.id,
                                billType: queryParms.type
                            }, function (params) {
                                ticket = params.ticket
                                $('#log').text(`成功获取凭证 ${ticket}`)
                                resolve(ticket)
                            })
                            setTimeout(() => {
                                if (ticket === '') {
                                    $('#log').text(`获取凭证失败 ${queryParms.id}`)
                                    setTimeout(() => {
                                        doIt()
                                    }, 300)
                                }
                            }, 1000)
                        }
                        doIt()
                    })
                }
                billQueryPreauthFn()
                    // 好 刷到了
                    .then(ticket => {
                        ztoAjax({
                            url: url + "&queryTicket=" + ticket,
                            type: "get",
                            data: "",
                            index: index,
                            bill: bill,
                            id: id,
                            text: text
                        });
                        $(currentButton).addClass("curr");
                    })
            } else {
                $(this).removeClass("curr");
                var id = $(this).find("button").attr("data-id");
                if ($(this).find("button").html() != "修改记录") {
                    $("." + id).remove();
                } else {
                    $("." + id).removeClass("curr");
                }
            }
        })
    }
    // 缓存元素
    cache () {
        // 原页面带的元素
        this.$ZTO_input = $('#txtJobNoList')
        // 新增的元素
        this.$panel = $('#panel')
        this.$panelToggleBtn = $('#panelToggleBtn')
        this.$uploader = $('#uploader')
        this.$control = $('#control')
        this.$startButton = $('#startButton')
        this.$downloadButton = $('#downloadButton')
    }
    // 注册事件
    register () {
        // 切换显示隐藏面板
        this.$panelToggleBtn.on('click', () => {
            if (this.$panel.is(":hidden")) {
                this.panelShow()
            } else {
                this.panelHide()
            }
        })
        // Excel载入
        this.$uploader.on('change', () => {
            const file = this.$uploader.get(0).files[0]
            const reader = new FileReader()
            reader.readAsText(file, 'utf-8')
            reader.onload = e => {
                this.ids = e.target.result.split("\n")
                if (this.ids.length > 0) {
                    this.$control.show()
                }
                console.log(this.ids)
            }
        })
        // 开始按钮
        this.$startButton.on('click', () => {
            this.startSearch()
        })
        // 下载按钮
        this.$downloadButton.on('click', () => {
            this.exportCSV()
        })
    }
    // 显示面板
    panelShow () {
        this.$panel.show()
        this.$panelToggleBtn.text('隐藏')
    }
    // 隐藏面板
    panelHide () {
        this.$panel.hide()
        this.$panelToggleBtn.text('显示')
    }
    // 开始搜索数据
    startSearch () {
        $("#txtJobNoList").val(this.ids[0])
        search()
            .then(() => {
                console.log('OK')
            })
    }
    // 将数据以CSV形式导出
    exportCSV () {
        // 合并参数
        const _params = {
            columns: [
                {label: '运单编号', prop: 'yundanbianhao'},
                {label: '订单编号', prop: 'dingdanbianhao'},
                {label: '订单时间', prop: 'dingdanshijian'},
                {label: '发件人(电话)', prop: 'fajianrendianhua'},
                {label: '发件人地址', prop: 'fajianrendizhi'},
                {label: '收件人(电话)', prop: 'shoujianrendianhua'},
                {label: '收件人地址', prop: 'shoujianrendizhi'},
                {label: '揽件人', prop: 'lanjianren'},
                {label: '收件网点', prop: 'shoujianwangdian'},
                {label: '订单来源', prop: 'dingdanlaiyuan'}
            ],
            data: [
                {
                    name: 'lucy',
                    age: 24
                  },
                  {
                    name: 'bob',
                    age: 26
                  }
            ],
            title: 'table',
            noHeader: false
        }
        // 生成数据
        const data = Csv(_params.columns, _params.data, {}, _params.noHeader)
        // 下载数据
        ExportCsv.download(_params.title, data)
    }
}