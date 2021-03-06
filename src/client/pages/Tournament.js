import React, { Component } from 'react';
import { getNearRestaurantList } from '../utils';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress'
import { withStyles } from '@material-ui/core/styles';

import Footer from '../components/Footer';
import Loading from '../components/Loading';
import KakaoMap from '../components/KakaoMap';

import { getShortenURL } from '../utils';

import WinkEmoji from '../assets/wink-emoji.png';
import CelebrateEmoji from '../assets/celebrate-emoji.png';
import ScreamEmoji from '../assets/scream-emoji.png';
import RandomRetry from '../assets/random-retry.png';
import AddressCopy from '../assets/address-copy.svg';
import UrlLink from '../assets/url-link.svg';
import TournamentVS from '../assets/tournament-vs.svg';
import ShareLink from '../assets/share-link.svg';
import VerticalDots from '../assets/vertical-dots.svg';
import './app.css';

import DumplingIcon from '../assets/dumpling-icon.png';
import RiceIcon from '../assets/rice-icon.png';
import ChickenIcon from '../assets/chicken-icon.png';
import BurgerIcon from '../assets/burger-icon.png';
import SushiIcon from '../assets/sushi-icon.png';
import OctopusIcon from '../assets/octopus-icon.png';
import PizzaIcon from '../assets/pizza-icon.png';
import DosirakIcon from '../assets/dosirak-icon.png';
import TacoIcon from '../assets/taco-icon.png';
import BunsikIcon from '../assets/bunsik-icon.png';
import JookIcon from '../assets/jook-icon.png';
import SaladIcon from '../assets/salad-icon.png';
import SandwichIcon from '../assets/sandwich-icon.png';
import BakeryIcon from '../assets/bakery-icon.png';
import WesternIcon from '../assets/western-icon.png';
import AsianIcon from '../assets/asian-icon.png';

const copy = require('copy-text-to-clipboard');
const food_category = [
  { id: 'korean', name: '한식', color: '#D8E3FF', icon: RiceIcon },
  { id: 'burger', name: '버거', color: '#FFE6C0', icon: BurgerIcon },
  { id: 'chinese', name: '중식', color: '#FFF5D0', icon: DumplingIcon },
  { id: 'japanese', name: '일식', color: '#FFE3DA', icon: SushiIcon },
  { id: 'seafood', name: '해산물', color: '#FFE3DA', icon: OctopusIcon },
  { id: 'chicken', name: '치킨', color: '#FFE6C0', icon: ChickenIcon },
  { id: 'pizza', name: '피자', color: '#FFF5D0', icon: PizzaIcon },
  { id: 'dosirak', name: '도시락', color: '#FFE3DA', icon: DosirakIcon },
  { id: 'mexican', name: '멕시칸', color: '#FFE6C0', icon: TacoIcon },
  { id: 'bunsik', name: '분식', color: '#FFF5D0', icon: BunsikIcon },
  { id: 'bakery', name: '베이커리', color: '#D8E3FF', icon: BakeryIcon },
  { id: 'jook', name: '죽', color: '#FFE6C0', icon: JookIcon },
  { id: 'salad', name: '샐러드', color: '#D8E3FF', icon : SaladIcon },
  { id: 'sandwich', name: '샌드위치', color: '#FFF5D0', icon : SandwichIcon },
  { id: 'western', name: '양식', color: '#FFE3DA', icon : WesternIcon },
  { id: 'asian', name: '아시안', color: '#D8E3FF', icon : AsianIcon },
];

const TournamentButton = withStyles({
  root: {
    background: 'transparent',
    borderRadius: 24,
    border: 'none',
    height: 182,
    minWidth: 248,
    maxWidth: 248,
  },
  label: {
    textTransform: 'none'
  }
})(Button);

const ResultButton = withStyles({
  root: {
    background: '#ffffff',
    borderRadius: 24,
    border: '1px solid #DFDFDF',
    boxSizing: 'border-box',
    height: 48,
    minWidth: 200,
    maxWidth: 200,
  },
  label: {
    textTransform: 'none'
  }
})(Button);

export default class TournamentPage extends Component {
  restaurantList;
  categoryList;
  matchList;
  kakaoMap;

  constructor(props) {
    super(props);
    this.state = {
      copyLoading: false,
      isLoaded: false,
      isGenerated: false,
      latitude: 0,
      longitude: 0,
      isFinished: false,
      comp: 0,
      winnerCate: 0,
      selected: [],
      noResult: false,
      selectedIdx: 0
    };
    this.restaurantList = [];
    this.categoryList = {};
    this.matchList = [];
    this.kakaoMap = React.createRef();

    this.getShuffledMatch();
  }

  getShuffledMatch = () => {
    /* tournament info */
    this.matchList = [];
    for (var i = 0; i < 16; i++) {
      this.matchList[i] = i;
    }
    /* shuffle */
    for (var i = 0; i < 16; i++) {
      const idx = Math.floor(Math.random() * 16);
      var tmp = this.matchList[i];
      this.matchList[i] = this.matchList[idx];
      this.matchList[idx] = tmp;
    }
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      this.setState({
        latitude, longitude,
        isLoaded: true
      });
    }, (error) => {
      this.props.history.push('/error');
    }, { maximumAge: 0 });
  }

  setRandomInfo = async (latitude, longitude, cate) => {
    var noResultFlag = false;
    const query = food_category[cate].id === 'asian' ?
        "아시안" : food_category[cate].name;
    var restList = await getNearRestaurantList(
        latitude, longitude, query
      );
    if (restList.length === 0) {
      noResultFlag = true;
      restList = await getNearRestaurantList(latitude, longitude);
    }
    this.restaurantList = restList;
    const idxArray = [];
    for (var i = 0; i < Math.min(3, restList.length); ++i) {
      while (true) {
        const randomIdx = Math.floor(Math.random() * this.restaurantList.length);
        if (idxArray.includes(randomIdx)) { continue; }
        else { 
          idxArray.push(randomIdx);
          break;
        }
      }
    }
    const randomRest = this.restaurantList[idxArray[0]];

    this.setState({isFinished: true, selected: idxArray,
        winnerCate: cate, noResult: noResultFlag, selectedIdx: 0});
    this.kakaoMap.current.moveMap(randomRest.y, randomRest.x);
  }

  selectOne = async (cate) => {
    if (this.state.comp === 28) { // finally pick
      const { latitude, longitude } = this.state;
      this.setRandomInfo(latitude, longitude, cate);
    } else {
      this.matchList.push(cate);
      this.setState({comp: this.state.comp + 2})
    }
  }

  renderCard = (index) => {
    const cate1 = this.matchList[index];
    const cate2 = this.matchList[index + 1];
    return (<div style={{position: 'relative'}}>
      <TournamentButton className="tournament-card"
          onClick={() => this.selectOne(cate1)}
          style={{background: food_category[cate1].color}}>
        <div style={{fontSize: '24px', position: 'absolute',
            fontWeight: 'bold', left: 24, top: 22}}>
          {food_category[cate1].name}
        </div>
        <img src={food_category[cate1].icon}
            style={{width: 104, height: 104,
                position: 'absolute', right: 32, bottom: 24}} />
      </TournamentButton>
      <div style={{height: '30px'}} />
      <TournamentButton className="tournament-card"
          onClick={() => this.selectOne(cate2)}
          style={{background: food_category[cate2].color}}>
        <div style={{fontSize: '24px', position: 'absolute',
            fontWeight: 'bold', left: 24, top: 22}}>
          {food_category[cate2].name}
        </div>
        <img src={food_category[cate2].icon}
            style={{width: 104, height: 104,
                position: 'absolute', right: 32, bottom: 24}} />
      </TournamentButton>
      <div className="centered-vs">
        <img src={TournamentVS} />
      </div>
    </div>)
  }

  getProgressString = () => {
    const { comp } = this.state;
    if (comp < 16) { 
      return `${comp / 2 + 1} / 8`;
    } else if (comp < 24) {
      return `${(comp - 16) / 2 + 1} / 4`;
    } else if (comp < 28) {
      return `${(comp - 24) / 2 + 1} / 2`;
    } else {
      return '1 / 1';
    }
  }

  getRoundString = () => {
    const { comp } = this.state;
    if (comp < 16) { 
      return '16강';
    } else if (comp < 24) {
      return '8강';
    } else if (comp < 28) {
      return '4강';
    } else {
      return '결승';
    }
  }

  getShareLink = async () => {
    this.setState({copyLoading: true});
    const { selected, selectedIdx } = this.state;
    const item = this.restaurantList[selected[selectedIdx]];
    var newURL = window.location.protocol + "//" + window.location.host + "/share/" 
        + `${item.y}/${item.x}/${item.id}/${item.category_name}/${item.place_name}/${item.road_address_name}`;
    try {
      const shortenURL = await getShortenURL(newURL);
      this.copyURL = shortenURL;
      this.setState({isGenerated: true, copyLoading: false});
    } catch (e) {
      this.copyURL = newURL;
      this.setState({isGenerated: true, copyLoading: false});
    }
  }

  moveMapCenter = (index) => {
    this.setState({selectedIdx: index})
    const {x, y} = this.restaurantList[this.state.selected[index]];
    this.kakaoMap.current.moveMap(y, x);
  }

  render = () => {
    return (
      <div className="app-root-div">
        {this.state.isLoaded ? 
          this.state.isFinished ? 
            <div className="app-page-wrapper">
              <div className="app-main-div">
                { this.state.noResult ? 
                  <div style={{fontSize: '20px', fontWeight: 'bold', paddingBottom: '32px'}}>
                    <div>주변에 해당하는</div>
                    <div style={{display: 'flex', flexDirection: 'row',
                        alignItems: 'center', height: 24, lineHeight: 24}}>
                      음식점이 없습니다 
                      <img src={ScreamEmoji} width={24} height={24} 
                          style={{paddingLeft: 7}} />
                    </div>
                    <div>대신 냠냠이 골라줄게요!</div>
                  </div>
                  :
                  <div style={{fontSize: '20px', fontWeight: 'bold', paddingBottom: '32px'}}>
                    <div style={{display: 'flex', flexDirection: 'row',
                        alignItems: 'center', height: 24, lineHeight: 24}}>
                      오예!
                      <img src={CelebrateEmoji} width={24} height={24} 
                          style={{paddingLeft: 7}} />
                    </div>
                    <div>오늘의 우승 메뉴</div>
                  </div>
                }
                { this.state.noResult ? null :
                  <div className="app-main-div">
                    <div style={{display: 'flex', paddingBottom: '32px',
                        justifyContent: 'center', alignItems: 'center'}}>
                      <div style={{width: '248px', height: '182px',
                          borderRadius: '24px', position: 'relative', 
                          background: food_category[this.state.winnerCate].color}}>
                        <div style={{fontSize: '24px', position: 'absolute',
                            fontWeight: 'bold', left: 24, top: 22}}>
                          {food_category[this.state.winnerCate].name}
                        </div>
                        <img src={food_category[this.state.winnerCate].icon}
                            style={{width: 104, height: 104,
                                position: 'absolute', right: 32, bottom: 24}} />
                      </div>
                    </div>
                    <div style={{width: '280px', height: '1px', background: '#E5E5E5'}} />
                    <div style={{height: '32px'}} />
                  </div>
                }
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                  <KakaoMap lat={this.state.latitude} lng={this.state.longitude} 
                      ref={this.kakaoMap} />
                </div>
                <div style={{height: '16px'}} />
                { this.state.selected.map((val, idx) => {
                  const selected = this.restaurantList[val];
                  const color = food_category[this.state.winnerCate].color;
                  return (
                    <div style={{paddingTop: '16px', paddingBottom: '16px',
                        borderBottom: idx === this.state.selected.length - 1 ? '' : '1px solid #E5E5E5',
                        display: 'flex', flexDirection: 'column'}}
                        key={selected.id}>
                      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <div className='category-tag' style={{backgroundColor: color}}>
                          {selected.category_name}
                        </div>
                        <div style={{paddingLeft: '8px', fontSize: '14px', cursor: 'pointer',
                            color: this.state.selectedIdx === idx ? '#428ff7' : '#000000'}}
                            onClick={() => this.moveMapCenter(idx)}>
                          {selected.place_name}
                        </div>
                      </div>
                      <div style={{color: '#929292', fontSize: '12px', height: 24,
                          display: 'flex', flexDirection: 'row', alignItems: 'center',
                          paddingTop: '9px'}}>
                        {selected.road_address_name}
                        <div style={{width: '8px' }} />
                        <img src={AddressCopy} width={24} height={24} 
                            onClick={() => {
                              copy(selected.road_address_name);
                              alert('주소가 복사되었습니다.');
                            }}
                            style={{cursor: 'pointer'}} />
                        <div style={{width: '8px' }} />
                        <a target="_blank" href={selected.place_url}
                            style={{width: '80px', height: '24px', cursor: 'pointer',
                                display: 'flex', flexDirection: 'row', borderRadius: '24px',
                                alignItems: 'center', justifyContent: 'center', color: '#929292',
                                textDecoration: 'none', border: '1px solid #DFDFDF'}}>
                          <div style={{paddingRight: '4px'}}>카카오맵</div>
                          <img src={UrlLink} width={10} height={10} />
                        </a>
                      </div>
                    </div>
                  )
                })}
                <div style={{height: '36px'}} />
                <div style={{display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', paddingBottom: 32}}>
                  { this.state.isGenerated ?
                    <ResultButton className="white-button" disabled={!this.state.isGenerated}
                        onClick={() => {
                          copy(this.copyURL);
                          alert('공유 링크가 복사되었습니다.');
                        }}>
                      <div style={{display: 'flex', flexDirection: 'row',
                          alignItems: 'center', justifyContent: 'center'}}>
                        <div style={{paddingRight: '4px'}}>공유 링크 복사하기</div>
                        <img style={{verticalAlign: 'middle'}} src={ShareLink} />
                      </div>
                    </ResultButton>
                  :
                    <ResultButton className="white-button" disabled={this.state.copyLoading}
                        onClick={() => this.getShareLink()}>
                      { this.state.copyLoading ? 
                          <div style={{display: 'flex', flexDirection: 'row',
                              alignItems: 'center', justifyContent: 'center'}}>
                            <div style={{paddingRight: '4px'}}>링크 생성 중...</div>
                            <CircularProgress size={16} thickness={7} color="inherit" />
                          </div>
                          :
                        <div style={{display: 'flex', flexDirection: 'row',
                            alignItems: 'center', justifyContent: 'center'}}>
                          <div>결과 링크 공유하기</div>
                        </div>
                      }
                    </ResultButton>
                  }
                  <div style={{height: '16px'}} />
                  <ResultButton className='white-button'
                      disabled={this.state.copyLoading}
                      onClick={() => {
                        this.getShuffledMatch();
                        this.setState({comp: 0, isFinished: false, winnerCate: 0,
                            isGenerated: false, copyLoading: false});
                      }}>
                      <div style={{paddingRight: '4px'}}>월드컵 다시 하기</div>
                      <img src={RandomRetry} width={16} height={16} 
                          style={{verticalAlign: 'middle'}} />
                  </ResultButton>
                  <div style={{height: '32px'}} />
                  <img src={VerticalDots} />
                </div>
              </div>
              <Footer />
            </div>
            :
            <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
              <div className="app-main-div">
                <div style={{display: 'flex', flexDirection: 'column',
                    alignItems: 'center'}}>
                  <div style={{fontSize: '20px', fontWeight: 'bold', width: '280px',
                      paddingBottom: '40px', display: 'flex', flexDirection: 'row',
                      justifyContent: 'space-between', alignItems: 'flex-end'}}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <div>메뉴 월드컵!</div>
                      <div style={{display: 'flex', flexDirection: 'row',
                          alignItems: 'center', height: 24, lineHeight: 24}}>
                        오늘의 취향은?
                        <img src={WinkEmoji} width={24} height={24} 
                            style={{paddingLeft: 7}} />
                      </div>
                      <div style={{height: 8}} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      <div style={{fontSize: '14px', fontWeight: 'bold', color: '#929292'}}>
                        {this.getRoundString()}
                      </div>
                      <div style={{height: 8}} />
                      <div style={{height: 40, padding: '0 22px', background: '#EAEAEA',
                          lineHeight: 40, borderRadius: 24, display: 'flex',
                          justifyContent: 'center', alignItems: 'center',
                          fontSize: '16px', fontWeight: 'bold', color: '#929292'}}>
                        {this.getProgressString()}
                      </div>
                    </div>
                  </div>
                  { this.renderCard(this.state.comp) }
                </div>
              </div>
            </div>
          : <Loading />
        }
      </div>
    );
  }
}
