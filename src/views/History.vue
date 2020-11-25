<template>
  <div class="about">
    <v-container style="max-width: 100%!important;">
      <v-row>
        <v-col cols="12" md="12">
          更新日志
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    版本号
                  </th>
                  <th class="text-left">
                    内容
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0.2.19</td>
                  <td>集成主站工具，修改弹幕播报的配置位置。</td>
                </tr>
                <tr>
                  <td>0.2.18</td>
                  <td>优化直播开播，加入封面缓存。</td>
                </tr>
                <tr>
                  <td>0.2.17</td>
                  <td>优化OBS控制，加入分区检测。</td>
                </tr>
                <tr>
                  <td>0.2.16</td>
                  <td>修复配置文件保存和读取的bug，加入流检测。</td>
                </tr>
                <tr>
                  <td>0.2.15</td>
                  <td>加入播报句式，方便自定义化。</td>
                </tr>
                <tr>
                  <td>0.2.14</td>
                  <td>加入投喂列表，修复OBS控制的错误提示输出。</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>