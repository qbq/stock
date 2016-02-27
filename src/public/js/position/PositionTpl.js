<%
  var hold = position.RepQueryHoldRsp,
      holdList = position.RepQueryHoldRsp.StkHoldList;
%>
<div class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title">我的持仓</h3>
    </div>
    <div class="panel-body">
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
                <th>总资产</th>
                <th>总市值</th>
                <th>资金余额</th>
                <th>冻结金额</th>
                <th>浮动盈亏</th>
                <th>总收益</th>
            </thead>
            <tbody>
              <td><%=hold.TotalCapital%></td>
              <td><%=hold.TotalValue%></td>
              <td><%=hold.AvailCapital%>%</td>
              <td><%=hold.FreezeCapital%></td>
              <td><%=0%></td>
              <td><%=hold.TotalProfit%></td>
            </tbody>
          </table>
        </div>
        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <thead>
                <th>股票名称</th>
                <th>股票代码</th>
                <th>持股数量</th>
                <th>可用数量</th>
                <th>冻结数量</th>
                <th>成本价格</th>
                <th>最新市价</th>
                <th>浮动盈亏</th>
                <th>市值</th>
            </thead>
            <tbody>
              <%_.each(holdList, function(pos){%>
              <td><%=pos.ProductName%></td>
              <td><%=pos.ProductCode%></td>
              <td><%=pos.PosAmount%></td>
              <td><%=pos.AvailAmount%></td>
              <td><%=0%></td>
              <td><%=0%></td>
              <td><%=pos.NewPrice%></td>
              <td><%=pos.Profit%></td>
              <td><%=pos.Value%></td>
              <%})%>
            </tbody>
          </table>
        </div>
    </div>
</div>