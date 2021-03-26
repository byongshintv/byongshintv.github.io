var 코멘트세팅 = {
    새로고침간격:3000,
    패킷간격:500,
    갤아디기본값:"stockus",
    version:"1.0",
}

var getComments = async function(no){
    var galleryID = 코멘트세팅.갤아디기본값 || $(document).data('gallery_id') || getURLParameter("id");
    var targetComments = [];
    var nextCommentPage = 1
    while(true){
            var {total_cnt,comments} = await $.ajax({
                type:'POST',
                url:'https://gall.dcinside.com/board/comment/',
                cache: false,
                dataType: "json",
                data:{ 
                    id:galleryID, 
                    no:no, 
                    cmt_id:galleryID, 
                    cmt_no:no, 
                    e_s_n_o: $("#e_s_n_o").val(), 
                    comment_page: nextCommentPage, 
                    sort: "R", 
                    board_type: $("#board_type").val() ,
                    _GALLTYPE_ :$("#_GALLTYPE_").val()},
            })
            await asleep(코멘트세팅.패킷간격)
            targetComments = targetComments.concat(comments)
            if(total_cnt / 100 < nextCommentPage++) break;

    }
    return targetComments.filter(v => v ? v.no !== 0 : false)
}

async function asleep(interval, rInterval = 0){
	return new Promise(async function(res,rej){
		var addInterval = Math.random() * rInterval - (rInterval/2)
		setTimeout(function(){
			res()
		}, interval + addInterval)
	})
}
async function getFixedUserCommentes(no,length){
	var raw = await getComments(no)
	var result = [...new Set(raw.filter(v => v.user_id !== "").map(v => `${v.name}(${v.user_id})` ))]
	return result.shuffle().slice(0,length-1).concat("담당일진연가냄(rnaos1234)").shuffle()
}

Array.prototype.shuffle = (function(){ return this.sort( () => 0.5 - Math.random())});

async function main(){
    var result = await getFixedUserCommentes("1035046",5);
    console.log(result)

}
main()