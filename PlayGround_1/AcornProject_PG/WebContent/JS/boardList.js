window.onload = function(){
	// 글쓰기 버튼 클릭 이벤트 등록
	document.getElementById('write').addEventListener('click', function(){
		location.href = '../Board/writeBoard.jsp';
	}, false);

	// 카테고리 선택 이벤트 등록
	document.getElementById('boardCategory').addEventListener('change', getChangedBoardList, false);

	// 게시판 검색 이벤트 등록
	document.getElementById('search').addEventListener('click', getBoardSearchList, false);
	document.getElementById('searchText').addEventListener('keypress', function(event){
		if (event.key === 'Enter') {
			getBoardSearchList();
		}
	}, false);

	// 페이지 로딩 시 보여줄 게시판 불러오기
	getBoardList();
};

/* JSP에 새로운 태그 및 컨텐츠 삽입 */
function insertElement(childTag, parentId, content, attr, attrVal){
	let newEle = document.createElement(childTag);
	if (attr && attrVal)
		newEle.setAttribute(attr, attrVal);
	newEle.innerHTML = content;
	let parentEle = document.getElementById(parentId);
	parentEle.appendChild(newEle);
}

/* 모든 요소 삭제 (데이터 갱신 시 기존 데이터 삭제 위함) */
function removeAllElements(query){
	let removeEles = document.querySelectorAll(query);
	for (let i=0; i<removeEles.length; i++)
		removeEles[i].parentNode.removeChild(removeEles[i]);
}

/* 페이징 처리 */
function paging(totalData, maxDataPerPage, maxPagePerWindow, currentPage){
	let totalPage = Math.ceil(totalData / maxDataPerPage); // 총 페이지수
	let pageGroup = Math.ceil(currentPage / maxPagePerWindow); // 페이지 그룹
	
	let last = pageGroup * maxPagePerWindow; // 화면에 보여질 마지막 페이지 번호
	if (last > totalPage)
		last = totalPage;
	
	let first = last - (maxPagePerWindow-1); // 화면에 보여질 첫번째 페이지 번호
	if (first < 1)
		first = 1;

	let next = last + 1;
	let prev = first - 1;
	let html = '';

	if (prev > 0)
		html += '<a href="#" id="prev">&lt;</a>';

	for (let i=first; i<=last; i++)
		html += '<a href="#" id="page' + i + '">' + i + '</a>';

	if (last < totalPage)
		html += '<a href="#" id="next">&gt;</a>';

	document.getElementById('paging').innerHTML = html;
	document.getElementById('page' + currentPage).style.fontWeight = 'bold';

	let pages = document.querySelectorAll('#paging a');
	pages.forEach(page => {
		page.addEventListener('click', function(){
			let id = this.getAttribute('id');
			let selectedPage = this.innerText;
	
			if (id == 'next')
				selectedPage = next;
			if (id == 'prev')
				selectedPage = prev;

			paging(totalData, maxDataPerPage, maxPagePerWindow, selectedPage);
		}, false);
	});
}

/* 게시판 데이터 파싱 후 출력 */
function jsonParserForBoard(data){
	let totalData = data.length; // 총 게시글 수
	let maxDataPerPage = 5; // 한 페이지에 나타낼수 있는 게시글수
	let maxPagePerWindow = 5; // 한 화면에 나타낼수 있는 페이지 수
	paging(totalData, maxDataPerPage, maxPagePerWindow, 1);

	for (let i=0; i<data.length; i++){
		let jsonObj = JSON.parse(data[i]);
		insertElement('tr', 'boardList', '', 'id', 'board'+i);
		insertElement('td', 'board'+i, jsonObj.boardCategory);
		insertElement('td', 'board'+i, '<a href="../BoardDetailServlet?boardId='
			+ jsonObj.boardId + '">' + jsonObj.boardName + '</a>');
		insertElement('td', 'board'+i, jsonObj.mbrName);
		insertElement('td', 'board'+i, jsonObj.boardDate);
		insertElement('td', 'board'+i, jsonObj.boardCount);
		insertElement('td', 'board'+i, jsonObj.boardLiked);
	}
}

/* 게시판 글 목록 불러오기 (첫 로딩)*/
function getBoardList(){
	fetch('../BoardListServlet?boardKind=boardList&&boardCategory=all')
		.then(res => res.json())
		.then(data => {
			jsonParserForBoard(data);
		})
		.catch(err => {
			console.log(err);
		});
}

/* 게시판 글 목록 불러오기 (카테고리 선택 시)*/
function getChangedBoardList(){
	let boardCategory = document.getElementById('boardCategory').value;

	fetch('../BoardListServlet?boardKind=boardList&&boardCategory=' + boardCategory)
		.then(res => res.json())
		.then(data => {
			removeAllElements('tr[id^="board"]');
			jsonParserForBoard(data);
		})
		.catch(err => {
			console.log(err);
		});
}

/* 게시판 검색 결과 불러오기 */
function getBoardSearchList(){
	let searchCategory = document.getElementById('searchCategory').value;
	let searchText = document.getElementById('searchText').value;
	let boardCategory = document.getElementById('boardCategory').value;
	document.getElementById('searchText').value = '';

	fetch('../BoardListServlet?boardKind=boardSearchList&&searchCategory='
		+ searchCategory + '&&searchWord=' + searchText + '&&boardCategory=' + boardCategory)
		.then(res => res.json())
		.then(data => {
			removeAllElements('tr[id^="board"]');
			jsonParserForBoard(data);
		})
		.catch(err => {
			console.log(err);
		});
}