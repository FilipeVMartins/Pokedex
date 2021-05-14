import React from 'react';
import logo from './logo.svg';
import './App.css';

export default class App extends React.Component {

  state = {
    pTypes: [],
    pNames: [],
    pNamesSearched: [],
    pRequestedList: [],
    selectedTypes: [],
    inputedText: ''
  }


  // shouldComponentUpdate(nextProps, nextState) { 
  //   if (nextState.pNamesAndTypes) { 
  //     return false;
  //   }
  //   return true;
  // }


  async componentDidMount(){

    // acording to pokeapi rules, results must be cashed to avoid IP address getting permanently banned. 'pokeapi-js-wrapper' is a library recomended in the docs to perform the caching, both json and images results.
    const Pokedex = require("pokeapi-js-wrapper")
    const P = new Pokedex.Pokedex()


    P.resource([
      // gets all the pokemons names in an array
      "/api/v2/pokemon?limit=100000&offset=0",
      // gets all types of pokemons in an array
      "/api/v2/type?limit=100000&offset=0"
    ]).then( response => {
      
      // create an array index with all types of pokemons, it's used to created the search filter
      let pTypes = response[1].results.map((type) => {
        return type.name;
      })
      // set type list
      this.setState({pTypes:pTypes})
      // set pokemon list to be searched
      this.setState({pNames:response[0].results})

      // none of this would work becaouse bot all pokemons are indexed in its api type pokemon list
      // // each object in this array will recieve one more element containing the types of its pokemon after the next request
      // let pNamesAndTypes = response[0].results.map((pokemon) => {
      //   return {'name':pokemon.name, 'url':pokemon.url, 'types':[] }
      // });

      // // makes a resquest for each pokemon type url to get all pokemons within each type
      // let pTypesUrls = response[1].results.map((type) => {
      //   return type.url;
      // });
      // P.resource(pTypesUrls)
      // .then( response2 => {

      //   // iterates all 20 types
      //   Object.entries(response2).forEach(([key, type]) => {

      //     // iterates through all pokemons within each type
      //     Object.entries(type.pokemon).forEach(([key, pokemon]) => {

      //       // gets the ID from the url
      //       let pokemonID = pokemon.pokemon.url.split('/')[6]

      //       if (pNamesAndTypes[pokemonID-1] != undefined){
      //         // add the element type name to the pNamesAndTypes respective pokemons ID minus one to equate to the respective indexes starting from 0
      //         pNamesAndTypes[pokemonID-1].types[pokemon.slot-1] = type.name;
      //       };

      //     });
      //   });
      //  // store the index with the pokemon types
      //  this.setState({pNamesAndTypes})
      // });

    });
  };

  // // gets all data of one pokemon
  // getOnePokemonData = (pokemonName) => {
  //   const Pokedex = require("pokeapi-js-wrapper")
  //   const P = new Pokedex.Pokedex()
  //   P.getPokemonByName(pokemonName)
  //   .then(function(response) {
  //     return response
  //   });
  // };




  changeSelectedTypes = (type) => {

    // get state
    let selectedTypes = this.state.selectedTypes;
    // check if the given type is alrdy in the list
    if(selectedTypes.indexOf(type) !== -1){
      // if yes, remove the found type with its index
      selectedTypes.splice(selectedTypes.indexOf(type), 1);
    } else{
      // else, add the new type
      selectedTypes.push(type)
    }
    // update state
    this.setState(selectedTypes)
  };

  onChangeInputHandler = (evt) => {

    // sets the searched text
    this.setState({inputedText:evt.target.value})

    // starts pokemon filtering search and requests after a minimum input of characters
    if (evt.target.value.length >= 2){
      
      // searched list
      let pNamesSearched = [];
      // loop pokemons list
      Object.entries(this.state.pNames).forEach(([key, pokemon]) => {

        // if inputed value matches pokemons name
        if (pokemon.name.includes(evt.target.value)){

          // push pokemon given registry to searched list
          pNamesSearched.push(pokemon);
        };
      });

      // saves pNamesSearched to state
      this.setState({pNamesSearched});
    } else {
      // if less than defined before, clear results
      this.setState({pNamesSearched: []});
    }



    // re-use alrdy requested pokemons
    let pRequestedList = this.state.pRequestedList;
    // pokemon query list
    let resourceStringList = [];
    // after building the 'pNamesSearched' searched locally on 'pNames', the program will use 'pNamesSearched' to bring the full data of each pokemon inside of it to the 'pRequestedList' state key, since it's a limitation of the API
    this.state.pNamesSearched.forEach((pokemon) => {
      // if pokemon not requested yet
      if( !this.checkPokemonRequested(pokemon.name) ){
        // then add it to request

        // build the resource string list
        resourceStringList.push(pokemon.url);
      };
    });

    const Pokedex = require("pokeapi-js-wrapper")
    const P = new Pokedex.Pokedex()
    // make the request with the created resourceStringList
    P.resource(resourceStringList).then( response => {
      console.log(response)
      // add the requested results to 'pRequestedList'
      this.setState({pRequestedList: [...this.state.pRequestedList ,...response]});

      console.log(this.state.pRequestedList)
    });


    
    //getOnePokemonData

  };

  checkPokemonRequested = (nametoCheck) => {
    this.state.pRequestedList.forEach((pokemon) => {

      if(pokemon != undefined){
        if(pokemon.name == nametoCheck){
          return true;
        };
      };
    });

    return false;
  };



  render() {

    return (
      <div className="app">

        <header className="app-header">
          <h1 onClick={() => console.log(this.state.pRequestedList)}>Pokédex</h1>
          <form>
            <input type="text" value={this.state.inputedText} onChange={(evt) => this.onChangeInputHandler(evt) }></input>
            <div className="select-pokemon-types">
              <h4>Selecione os tipos</h4>
              <div className="pokemon-types">
                {this.state.pTypes.map((type) => {
                  return (
                    <div key={`type-${type}`} className={`select-type ${type} ${this.state.selectedTypes.indexOf(type) !== -1 ? 'selected' : ''}`} onClick={() => this.changeSelectedTypes(type)} >{type}</div>
                  )
                })}
              </div>
            </div>
            {/* <div className="buttons">
              <button type="submit">Pesquisar</button>
              <button type="reset">Limpar</button>
            </div> */}
          </form>
        </header>


        <div className="app-content">
          <div className="pokemon-results">

            { this.state.pNamesSearched.length != 0 ?
              this.state.pNamesSearched.map( (pokemon, index) => {
                // because it starts rendering 6 rows by default
                if (true){



                    return (
                      <div className="pokemon-box" key={'pokemon-box-' + index}>
                        {pokemon.name}
                      </div>
                    )
                };
              })
            : ''}






          </div>
        </div>
      
        <footer className="app-footer">
            <div>
              <p>asdasd</p>
            </div>
        </footer>
    </div>
    );
  }
}
