import React, { Component} from 'react';
import { View, Text, TextInput, SafeAreaView, Button, FlatList, ScrollView, AppRegistry } from 'react-native';
import MapView from 'react-native-maps';
import * as stylist from '../resources/styles/Styles';
import API from '../lib/API.js';
import Calculations from '../lib/Calculations.js';
import Geocoder from 'react-native-geocoding';
import { Label } from 'native-base';

class RouteToevoegen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,  
            isError: false,  
            data: [], 
            dataStops: [],
            dataRoutes: [],
            route: '',
            omschrijving: '',
            stops: [],
            plaats: '',
            straat: '',
            record: '',
            radius: 0,
            showRoutes: false,
            clRoutes: [],
            extraFields: false
        }
    }
    //Alle fietsroutes moeten gefetchd worden omdat ze getoond moeten worden.
    //Alle tussenstops moeten gefetchd worden omdat elke tussenstop in de buurt gezocht moet worden.
    componentDidMount() {
        let url1 = "https://cockpit.educom.nu/api/collections/get/Fietsroute?token=9d13205f131c93ba9b696c5761a0d5";
        let url2 = "https://cockpit.educom.nu/api/collections/get/Tussenstops?token=9d13205f131c93ba9b696c5761a0d5";
        this.multipleFetch(url1, url2);
    }
    multipleFetch(url1, url2){
        API.fetchTwice(url1, url2)
        .then( result => {
            //console.warn(result);
            this.setState({
                isLoaded: true,
                dataRoutes: result.fietsroutes,
                dataStops: result.tussenstops,
            });
        })
    }

    goToSearch(){
        var closeRoutes = this.searchCloseRoutes();
        console.warn(closeRoutes);
        this.setState({clRoutes: closeRoutes, showRoutes: true});
    }

    renderRoutes(){
        if(this.state.showRoutes){
            return(
                <FlatList 
                    data={this.state.clRoutes}
                    renderItem={(item) => this.renderAnItem(item)}
                    keyExtractor={ item => item._id.toString()}>
                </FlatList>
            )
        }
    }

    //showState op aan zetten als op knop gedrukt wordt

    renderAnItem(item){
        console.warn(item);
        return(
            <View key={item.item._id} style={stylist.styling}>
                <Text>
                    <Text style={stylist.textstyle}>{item.item.routeNaam}</Text> 
                    <Text style={stylist.textstyle}>{item.item.Afstand}</Text>
                </Text>
                <Text>{item.item.Omschrijving}</Text>
                <Button title="Tussenstopinfo" 
                    onPress={() => this.props.navigation.navigate('TussenstopDetail', { item: item.item})}/>
            </View>
        )
    }

    searchCloseRoutes(){
        //Filter alle fiets/wandelroutes
        var datas = this.state.dataRoutes.filter((item) => item.Record_Type == this.state.record);

        //Filter de stop eruit met dezelfde plaats- en straatnaam als de opgegeven plaats- en straatnaam.
        //Dit is nu aangevuld met coordinateninfo.
        var stop = this.state.dataStops.filter((item) => item.Plaatsnaam == this.state.plaats
                                                    &&    item.Straatnaam == this.state.straat)

        var closeStops = []; var closeRoutes = [];

        //Filter uit alle stops de closeStops die dicht genoeg bij opgehaalde stop liggen.
        for(var i = 0; i < this.state.dataStops.length; i++){
            if(Calculations.calculateDistance(this.state.dataStops[i], stop[0]) <= this.state.radius){
                closeStops.push(this.state.dataStops[i]);
            } 
        }
        
        //Filter uit alle routes die closeRoutes waar de closeStops onderdeel van uitmaken
        for(var l = 0; l < datas.length; l++){
            for(var j = 0; j < closeStops.length; j++){
                if(closeStops[j].Route_id == datas[l]._id){
                    closeRoutes.push(datas[l]);
                    break;
                }
            }
        }
        return closeRoutes;
    }

    addFields(){
        this.setState({extraFields: true});
        const Google_key = "AIzaSyC5LpRoZZqJw7doPNk_2nZRtt1-cDraVfU";
        url = "https://maps.googleapis.com/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${Google_key}"
        Geocoder.geocode
    }

    extraStops(){
        if(this.state.extraFields){
            this.setState({extraFields: false});
            return(
                <View>
                    <View style={{margin: 10}}>
                            <Text>Plaatsnaam</Text>
                            <TextInput style={stylist.textfield} placeholder="Plaatsnaam"
                            onChangeText={(text) => {this.setState({plaats: text})}}></TextInput>
                        </View>
                        <View style={{margin: 10}}>
                            <Text>Straatnaam</Text>
                            <TextInput style={stylist.textfield} placeholder="Straatnaam"
                            onChangeText={(text) => {this.setState({straat: text})}}></TextInput>
                    </View>
                </View>
            )
        }
    }

    renderContent() {
        if(this.state.isLoaded) {
            return(
                <View>
                    <Text style={stylist.textstyle2}>Zoek nabijgelegen routes:</Text>
                    <View style={{margin: 10}}>
                        <Text>Routenaam</Text>
                        <TextInput style={stylist.textfield} placeholder="Routenaam"
                        onChangeText={(text)=> {this.setState({route: text})}}></TextInput>
                    </View>
                    <View style={{margin: 10}}>
                        <Text>Omschrijving</Text>
                        <TextInput style={stylist.textfield} placeholder="Omschrijving"
                        onChangeText={(text)=> {this.setState({omschrijving: text})}}></TextInput>
                    </View>
                    <View style={{margin: 10}}>
                        <Text>Fietsen of Wandelen?</Text>
                        <TextInput style={stylist.textfield} placeholder="F of W?"
                        onChangeText={(text)=> {this.setState({record: text})}}></TextInput>
                    </View>
                    <View style={{margin: 10}}>
                        <Text>Plaatsnaam</Text>
                        <TextInput style={stylist.textfield} placeholder="Plaatsnaam"
                        onChangeText={(text) => {this.setState({plaats: text})}}></TextInput>
                    </View>
                    <View style={{margin: 10}}>
                        <Text>Straatnaam</Text>
                        <TextInput style={stylist.textfield} placeholder="Straatnaam"
                        onChangeText={(text) => {this.setState({straat: text})}}></TextInput>
                    </View>
                    {this.extraStops()}
                    <Button title='+ tussenstop' onPress={() => {this.addFields()}}></Button>
                    <Button title='Zoek routes' onPress={() => {this.goToSearch()}}></Button>
                    {this.renderRoutes()}
                </View>
            )
        }else{
            <Text>Spinner</Text>
        }
    }
    render() {  
        return(
            <ScrollView>
                { this.renderContent() }
            </ScrollView>
        )
    }
}

export {RouteToevoegen};