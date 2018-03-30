import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import dateformat from 'dateformat';

export default class TimelineCard extends React.Component {
  constructor(props) {
    super(props)

    let stateVar = {
      fetchingData: true,
      dataJSON: {
        data: {},
        mandatory_config: {}
      },
      optionalConfigJSON: {},
      languageTexts: {},
      siteConfigs: this.props.siteConfigs,
      ready:false,
      curr: 1
    };

    if (this.props.dataJSON) {
      stateVar.fetchingData = false;
      stateVar.dataJSON = this.props.dataJSON;
    }

    if (this.props.optionalConfigJSON) {
      stateVar.optionalConfigJSON = this.props.optionalConfigJSON;
    }

    if (this.props.languageTexts) {
      stateVar.languageTexts = this.props.languageTexts;
    }

    this.state = stateVar;
  }

  exportData() {
    return document.getElementById('protograph_div').getBoundingClientRect();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.optionalConfigJSON) {
     this.setState({
       optionalConfigJSON: nextProps.optionalConfigJSON
     });
    }
  }

  componentDidMount() {
    // get sample json data based on type i.e string or object
    if (this.state.fetchingData){
      let items_to_fetch = [
        axios.get(this.props.dataURL)
      ];

      if (this.props.siteConfigURL) {
        items_to_fetch.push(axios.get(this.props.siteConfigURL));
      }
      axios.all(items_to_fetch).then(axios.spread((card, site_configs) => {
          let stateVar = {
            fetchingData: false,
            dataJSON: {
              data: card.data.data,
              mandatory_config: card.data.mandatory_config
            },
            optionalConfigJSON: {},
            siteConfigs: site_configs ? site_configs.data : this.state.siteConfigs
          };

          stateVar.dataJSON.mandatory_config.language = stateVar.siteConfigs.primary_language.toLowerCase();
          stateVar.languageTexts = this.getLanguageTexts(stateVar.dataJSON.mandatory_config.language);

          stateVar.optionalConfigJSON.start_button_color = stateVar.siteConfigs.house_colour;
          stateVar.optionalConfigJSON.start_button_text_color = stateVar.siteConfigs.font_colour;
          this.setState(stateVar);
        }));
    }
  }

  getLanguageTexts(languageConfig) {
    let language = languageConfig ? languageConfig : "english",
      text_obj;
    switch(language.toLowerCase()) {
      case "hindi":
        text_obj = {
          button_text: "चलो समय यात्रा करे",
          font: "'Hindi', sans-serif"
        }
        break;
      default:
        text_obj = {
          button_text: "Let's time travel",
          font: "'Helvetica Neue', sans-serif, aerial"
        }
        break;
    }
    return text_obj;
  }

  componentDidUpdate(){
    let events = Array.from(document.getElementsByClassName('single-event')),
    card = document.getElementsByClassName('timeline-card')[0],
    min = Infinity,
    event;
    if(!card){
      return;
    }
    Array.from(document.getElementsByClassName('active')).forEach((e)=>{
      e.classList.remove('active');
    })
    events.forEach((e)=>{
      let top = e.getBoundingClientRect().top;
      if(top > 0 &&  top < min){
        event = e;
        min = top;
      }
    })
    if ((card.scrollHeight - card.clientHeight) === card.scrollTop) {
      event = events[events.length - 1];
    }
    event.classList.add('active');
  }
  handleScroll(){
    let events = Array.from(document.getElementsByClassName('single-event')),
    card = document.getElementsByClassName('timeline-card')[0],
    min = Infinity,
    event, curr;
    Array.from(document.getElementsByClassName('active')).forEach((e)=>{
      e.classList.remove('active');
    })
    events.forEach((e,i)=>{
      let top = e.getBoundingClientRect().top;
      if(top > 0 &&  top < min){
        event = e;
        min = top;
        curr = i+1;
      }
    })
    if ((card.scrollHeight - card.clientHeight) === card.scrollTop) {
      event = events[events.length - 1];
      curr = events.length;
    }
    event.classList.add('active');
    this.setState({
      curr:curr
    })
  }
  
  matchDomain(domain, url) {
    let url_domain = this.getDomainFromURL(url).replace(/^(https?:\/\/)?(www\.)?/, ''),
      domain_has_subdomain = this.subDomain(domain),
      url_has_subdomain = this.subDomain(url_domain);

    if (domain_has_subdomain) {
      return (domain === url_domain) || (domain.indexOf(url_domain));
    }
    if (url_has_subdomain) {
      return (domain === url_domain) || (url_domain.indexOf(domain))
    }
    return (domain === url_domain)
  }

  getDomainFromURL(url) {
    let a = document.createElement('a');
    a.href = url;
    return a.hostname;
  }
  subDomain(url) {
    if(!url){
      url = "";
    }
    // IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
    url = url.replace(new RegExp(/^\s+/), ""); // START
    url = url.replace(new RegExp(/\s+$/), ""); // END

    // IF FOUND, CONVERT BACK SLASHES TO FORWARD SLASHES
    url = url.replace(new RegExp(/\\/g), "/");

    // IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
    url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i), "");

    // IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
    url = url.replace(new RegExp(/^www\./i), "");

    // REMOVE COMPLETE STRING FROM FIRST FORWARD SLASH ON
    url = url.replace(new RegExp(/\/(.*)/), "");

    // REMOVES '.??.??' OR '.???.??' FROM END - e.g. '.CO.UK', '.COM.AU'
    if (url.match(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i))) {
      url = url.replace(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i), "");

      // REMOVES '.??' or '.???' or '.????' FROM END - e.g. '.US', '.COM', '.INFO'
    } else if (url.match(new RegExp(/\.[a-z]{2,4}$/i))) {
      url = url.replace(new RegExp(/\.[a-z]{2,4}$/i), "");
    }

    // CHECK TO SEE IF THERE IS A DOT '.' LEFT IN THE STRING
    var subDomain = (url.match(new RegExp(/\./g))) ? true : false;

    return (subDomain);
  }
  renderLaptop() {
    if (this.state.fetchingData){
      return(<div>Loading</div>)
    } else {
      let data = this.state.dataJSON;
      let topDate = data.data.events[0].single_event.timestamp_date,
        bottomDate = data.data.events[data.data.events.length - 1].single_event.timestamp_date,
        topLabel = dateformat(new Date(topDate), "mmm yyyy"),
        bottomLabel = dateformat(new Date(bottomDate), "mmm yyyy"),
        percent = 100*(this.state.curr / data.data.events.length)+"%";
      let genreColor = this.state.optionalConfigJSON.house_colour,
        genreFontColor = this.state.optionalConfigJSON.font_colour;
        if(!this.state.dataJSON.mandatory_config.interactive){
          genreColor = "rgba(51, 51, 51, 0.75)",
          genreFontColor = "#fff";
        }
        if(this.state.dataJSON.mandatory_config.sponsored){
          genreColor = this.state.optionalConfigJSON.reverse_house_colour;
          genreFontColor = this.state.optionalConfigJSON.reverse_font_colour;
        }
        let fav = this.state.dataJSON.mandatory_config.faviconurl;
        let str = this.state.dataJSON.mandatory_config.url;
        let arr = str && str.split("/");
        let name = undefined;
        let dom = arr && arr[2];
        if (this.matchDomain(this.state.domain, str)) {
          fav = undefined;
        }
        let series = window.vertical_name || this.state.dataJSON.mandatory_config.series,
        genre = this.state.dataJSON.mandatory_config.genre;
        let padding = "1px 1px 1px 5px";
        if (!genre && series) {
          padding = "2.5px 5px";
        }
        if (!series && !genre) {
          padding = '0px';
        }
        if (genre && !series) {
          padding = "1px";
        }
        return(
          <div className="totimelinecard parent-card-desktop">
            <div className="first-view view">
              <div className="proto-col-3 view-in-desktop">
                <div className="card-tags">
                  {fav ?
                  <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.mandatory_config.iconbgcolor || 'white'}}>
                    <img className="favicon" src = {fav}/>
                  </div> : null}
                  <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                    {genre } </div> : null}
                    </div>
                      <div className="sub-genre-dark" style={{fontStyle:this.state.dataJSON.mandatory_config.sponsored? 'italic': 'normal', textDecoration:this.state.dataJSON.mandatory_config.sponsored? 'underline' : 'none'}}>
                        {this.state.dataJSON.mandatory_config.sponsored ?'Sponsored': this.state.dataJSON.mandatory_config.subgenre}
                      </div>
                </div>
                <div className="cover-content">
                  <div className="title">{data.mandatory_config.timeline_title}</div>
                  <div className="description">{data.mandatory_config.timeline_description}</div>
                  <div onClick={()=>{document.getElementsByClassName('totimelinecard')[0].classList.add('flipped');this.setState({ready:true})}} className="call-to-action-button">Let's time travel</div>
                </div>
              </div>
              <div className="proto-col-4">
                <div className="cover-image">
                  <img style={{height:"100%", width:"100%"}}src={data.mandatory_config.timeline_image}/>
                </div>
              </div>
            </div>
            <div className="second-view view">
              <div className="proto-col-3 view-in-desktop" style={{opacity:"0.3"}}>
                <div className="tag-area"></div>
                <div className="cover-content" style={{bottom:52}}>
                  <div className="title">{data.mandatory_config.timeline_title}</div>
                  <div className="description">{data.mandatory_config.timeline_description}</div>
                </div>
              </div>
              <div className="proto-col-4" onScroll={()=>this.handleScroll()}>
                <div className="progress-line" id="progress_desktop">
                  <div className="progress-start-lable">{topLabel}</div>
                  <div className="progress-container">
                    <div className="progress-after" style={{height: percent}}></div>
                    <div className="progress"></div>
                  </div>
                  <div className="progress-end-lable">{bottomLabel}</div>
                </div>
                <div className="main-content">
                  <div className="timeline-card">
                    {
                      data.data.events.map((d,i)=>{
                        let date = dateformat(new Date(d.single_event.timestamp_date), "mmm dd, yyyy")
                        return(
                          <div key={i} className="single-event">
                            <div className="timeline-time">{date}</div>
                            <div className="quiz-answer">
                              {d.single_event.header}
                            </div>
                            {d.single_event.photo && <div className="quiz-answer-image">
                              <img src={d.single_event.photo} style={{height:"100%", width:"100%"}} />
                            </div>}
                            <p>
                              {d.single_event.message}
                            </p>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  renderMobile() {
    if (this.state.fetchingData){
      return(<div>Loading</div>)
    } else {
      let data = this.state.dataJSON;
      let topDate = data.data.events[0].single_event.timestamp_date,
        bottomDate = data.data.events[data.data.events.length - 1].single_event.timestamp_date,
        topLabel = dateformat(new Date(topDate), "mmm yyyy"),
        bottomLabel = dateformat(new Date(bottomDate), "mmm yyyy"),
        percent = 100*(this.state.curr / data.data.events.length)+"%";
      let genreColor = this.state.optionalConfigJSON.house_colour,
        genreFontColor = this.state.optionalConfigJSON.font_colour;
        if(!this.state.dataJSON.mandatory_config.interactive){
          genreColor = "rgba(51, 51, 51, 0.75)",
          genreFontColor = "#fff";
        }
        if(this.state.dataJSON.mandatory_config.sponsored){
          genreColor = this.state.optionalConfigJSON.reverse_house_colour;
          genreFontColor = this.state.optionalConfigJSON.reverse_font_colour;
        }
        let fav = this.state.dataJSON.mandatory_config.faviconurl;
        let str = this.state.dataJSON.mandatory_config.url;
        let arr = str && str.split("/");
        let name = undefined;
        let dom = arr && arr[2];
        if (this.matchDomain(this.state.domain, str)) {
          fav = undefined;
        }
        let series = window.vertical_name || this.state.dataJSON.mandatory_config.series,
        genre = this.state.dataJSON.mandatory_config.genre;
        let padding = "1px 1px 1px 5px";
        if (!genre && series) {
          padding = "2.5px 5px";
        }
        if (!series && !genre) {
          padding = '0px';
        }
        if (genre && !series) {
          padding = "1px";
        }
        return(
          <div className="totimelinecard parent-card-mobile">
            <div className="first-view view">
              <div className="proto-col-4">
                <div className="cover-image">
                  <img style={{height:"100%", width:"100%"}} src={data.mandatory_config.timeline_image}/>
                  <div className="card-tags"  style={{position: "absolute",top:0}}>
                    {fav ?
                    <div className="publisher-icon" style={{backgroundColor:this.state.dataJSON.mandatory_config.iconbgcolor || 'white'}}>
                      <img className="favicon" src = {fav}/>
                    </div> : null}
                    <div className="series-name" style={{ padding: padding }}>{series}{genre ? <div className="genre" style={{backgroundColor: genreColor, color: genreFontColor, marginLeft: series?'3px' :'0px' }}>
                      {genre } </div> : null}
                      </div>
                      <div className="sub-genre-light" style={{fontStyle:this.state.dataJSON.mandatory_config.sponsored? 'italic': 'normal', textDecoration:this.state.dataJSON.mandatory_config.sponsored? 'underline' : 'none'}}>
                          {this.state.dataJSON.mandatory_config.sponsored ?'Sponsored': this.state.dataJSON.mandatory_config.subgenre}
                      </div>
                  </div>
                  <div className="black-overlay">
                    <div className="cover-content">
                      <div className="title font-white">{data.mandatory_config.timeline_title}</div>
                      <div className="description font-white">{data.mandatory_config.timeline_description}</div>
                      <div onClick={()=>{document.getElementsByClassName('totimelinecard')[0].classList.add('flipped');this.setState({ready:true})}} className="call-to-action-button">Let's time travel</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="second-view view">
              <div className="proto-col-4" onScroll={()=>this.handleScroll()}>
                <div className="progress-line" id="progress_mobile">
                  <div className="progress-start-lable">{topLabel}</div>
                  <div className="progress-container">
                    <div className="progress-after" style={{height: percent}}></div>
                    <div className="progress"></div>
                  </div>
                  <div className="progress-end-lable">{bottomLabel}</div>
                </div>
                <div className="main-content">
                  <div className="timeline-card">
                    {
                      data.data.events.map((d,i)=>{
                        let date = dateformat(new Date(d.single_event.timestamp_date), "mmm dd, yyyy")
                        return(
                          <div key={i} className="single-event">
                            <div className="timeline-time">{date}</div>
                            <div className="quiz-answer">
                              {d.single_event.header}
                            </div>
                            {d.single_event.photo && <div className="quiz-answer-image">
                              <img src={d.single_event.photo} style={{height:"100%", width:"100%"}} />
                            </div>}
                            <p>
                              {d.single_event.message}
                            </p>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  renderScreenshot() {
    if (this.state.fetchingData){
      return(<div>Loading</div>)
    } else {
      return (
        <div id="ProtoScreenshot">
          <div id="protograph_div" className = "protograph-card-div protograph-screenshot-mode">
              <div id="protograph_card_title_div">
                <div id="protograph_timeline_details_div" style={{width: '100%'}}>
                  <h1>{this.state.dataJSON.mandatory_config.timeline_title}</h1>
                  <p>{this.state.dataJSON.mandatory_config.timeline_description}</p>
                  <button id="protograph_show_main_card_button" style={{padding: '8px 10px', marginTop:0}} onClick={(e) => that.showMainCard(e)}>{this.state.languageTexts.button_text}</button>
                </div>
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    switch(this.props.mode) {
      case 'laptop' :
        return this.renderLaptop();
        break;
      case 'mobile' :
        return this.renderMobile();
        break;
      case 'screenshot' :
        return this.renderScreenshot();
        break;
    }
  }
}
