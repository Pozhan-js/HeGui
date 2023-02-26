  export default {
    data() {
      return {
        // 保单各状态数据
        data:  [
          { stautsText: '未投保', value: 'un_insurance', actionText: '发起担保'},
          { stautsText: '待生效', value: 'insurance_wait_effect', branchs: [
            { stautsText: '重复投保', value: 'insurance_repeat_effect', direction: 'up'},
            { stautsText: '投保失败', value: 'insurance_fail_effect', direction: 'down', textPos:'down'},
          ]},
          { stautsText: '已投保', value: 'insurance_in_effect', actionText: '发起退保', branchs: [
            { stautsText: '保单结束', value: 'insurance_finish', direction: 'down', textPos:'down'},
          ]},
          { stautsText: '退保中', value: 'insurance_wait_refund'},
          { stautsText: '已退保', value: 'insurance_refunded'}
        ]
      }
    },
    methods: {
      // 画保单流程图
      drawProgress() {
        const canvas = document.getElementById('canvas')
        const ctx = canvas.getContext('2d')
        const radius = 15, step = 120
        ctx.clearRect(0, 0, canvas.width, canvas.clientHeight)
        ctx.save()
        ctx.translate(40, 200)
        ctx.scale(1.1, 1.1)
        for(let i = 0, len = this.data.length; i< len; i++) {
          if(this.data[i].branchs) {
            for(let j = 0; j<this.data[i].branchs.length; j++ ) {
              const {stautsText, direction, textPos, value} = this.data[i].branchs[j]
              const yPoint = direction == 'up' ? -step: step - 20
              const ArrowStartYPoint = direction == 'up' ? -40: 20
              const ArrowEndXPoint = direction == 'up' ? step - radius + ArrowStartYPoint : yPoint - radius - ArrowStartYPoint
              let fillColor = value == this.insuredStatus ? '#f6953c' : '#f6953c33'
              this.drawArrow(ctx, {startPoint: {x:0, y:ArrowStartYPoint}, endPoint: {x: ArrowEndXPoint , y: ArrowStartYPoint }, direction: direction})
              this.drawCircle(ctx, {xPoint: 0, yPoint: yPoint, radius: radius, text:stautsText, textPos: textPos, fillColor})
            }
          }
          let fillColor = this.data[i].value == this.insuredStatus ? '#f6953c' : '#f6953c33'
          this.drawCircle(ctx, {xPoint: 0, yPoint: 0, radius: radius, text: this.data[i].stautsText, fillColor})
          if (i < len - 1) {
            this.drawArrow(ctx, { startPoint: { x: radius, y: 0 }, endPoint: { x: step - radius, y: 0 }, text: this.data[i].actionText })
          }
          ctx.translate(step, 0)
        }
        ctx.restore()
      },
     
      // 绘制圆点
      drawCircle(ctx, {xPoint, yPoint, radius, text, textPos = 'up', fillColor = "#f6953c33"}) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(xPoint,yPoint,radius,0,2*Math.PI)
        ctx.closePath()
        ctx.fillStyle = fillColor
        ctx.fill()

        switch(textPos) {
          case 'up': 
            ctx.translate(xPoint, yPoint - 25)
            break;
          case 'down':
            ctx.translate(xPoint, yPoint + 30)
            break;
          default:
            break;
        }
        ctx.fillStyle = "black"
        ctx.font = "12px Arial"
        ctx.textAlign = 'center'
        ctx.fillText(text, 0,  0 )
        ctx.restore()
      },

      // 绘制指示箭头
      drawArrow(ctx, {startPoint, endPoint, direction, text}) {
        let isDashed = false
        ctx.save()
        ctx.lineWidth = 1
        ctx.strokeStyle = "rgba(0,0,0,0.3)"
        ctx.translate(startPoint.x, startPoint.y)
        switch(direction) {
          case 'up': 
            ctx.rotate(-Math.PI / 2)
            isDashed = true
            break;
          case 'down':
            ctx.rotate(Math.PI / 2)
            isDashed = true
            break;
          default:
            break;
        }
        this.drawArrowLine(ctx, {startPoint: {x: 0, y: 0}, endPoint: {x: endPoint.x - startPoint.x, y:0}, isDashed: isDashed, text})
        this.drawArrowHead(ctx, {startPoint: {x: endPoint.x - startPoint.x - 6, y: - 6}, endPoint: {x: endPoint.x - startPoint.x, y: 0}})
        ctx.restore()

      },
      // 绘制箭头
      drawArrowHead(ctx, {startPoint, endPoint}) {
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.lineTo(startPoint.x, 2 * endPoint.y - startPoint.y);
        ctx.stroke()
        ctx.restore()
      },
      // 绘制线条
      drawArrowLine(ctx, {startPoint, endPoint, isDashed, text}) {
        ctx.save()
        if(isDashed) ctx.setLineDash([1, 2])
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.closePath()
        ctx.lineWidth = 1
        ctx.stroke()

        if (text) {
          ctx.translate((endPoint.x - startPoint.x) / 2, startPoint.y + 20)
          ctx.fillStyle="rgba(0,0,0,0.8)"
          ctx.textAlign = 'center'
          ctx.fillText(text, 0, 0, endPoint.x - startPoint.x)
        }
        ctx.restore()
      },
    }
  }