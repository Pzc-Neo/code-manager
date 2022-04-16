var app = new Vue({
  el:'#app',
  data:{
    sort_file_list_current_index:0,
    current_group_name:"默认文件夹",
    file_list:[
      ['文件名1','2020-09-28 09:08:11','文件ID'],
      ['文件名2','2020-09-28 09:08:11','文件ID'],
      ['文件名3','2020-09-28 09:08:11','文件ID'],
      ['文件名4','2020-09-28 09:08:11','文件ID'],
      ['文件名5','2020-09-28 09:08:11','文件ID'],
      ['文件名6','2020-09-28 09:08:11','文件ID'],
      ['文件名7','2020-09-28 09:08:11','文件ID'],
      ['文件名8','2020-09-28 09:08:11','文件ID'],
      ['文件名9','2020-09-28 09:08:11','文件ID'],
      ['文件名10','2020-09-28 09:08:11','文件ID'],
      ['文件名11','2020-09-28 09:08:11','文件ID'],
      ['文件名12','2020-09-28 09:08:11','文件ID'],
      ['文件名13','2020-09-28 09:08:11','文件ID'],
      ['文件名14','2020-09-28 09:08:11','文件ID'],
      ['文件名15','2020-09-28 09:08:11','文件ID'],
      ['文件名16','2020-09-28 09:08:11','文件ID'],
    ],
  }
  ,
  mounted(){
  }
  ,
  methods:{
    sort_file_list_move_to_top:function(){
      temp= this.file_list[0]
      this.file_list[0] = this.file_list[this.sort_file_list_current_index]
      this.file_list[this.sort_file_list_current_index]=temp
    }
    ,
    sort_file_list_change_current_index:function(index){
      //       console.log(index,typeof index)
      this.sort_file_list_current_index = index
    }
  }
}
                 )
