import {useState,useEffect,useRef} from 'react'
import { createSearchParams } from "react-router-dom";
import Axios from 'axios'
import { configuration, SideMainLayoutHeader,SideMainLayoutMenu, breadCrumbs } from './Configs';
import { applicationVersionUpdate } from '../components/Functions';

import CustomHeader from "../components/HeaderApp";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from '@cloudscape-design/components/side-navigation';

import Flashbar from "@cloudscape-design/components/flashbar";
import { StatusIndicator } from '@cloudscape-design/components';
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Tabs from "@cloudscape-design/components/tabs";


import '@aws-amplify/ui-react/styles.css';

import { SplitPanel } from '@cloudscape-design/components';


export const splitPanelI18nStrings: SplitPanelProps.I18nStrings = {
  preferencesTitle: 'Split panel preferences',
  preferencesPositionLabel: 'Split panel position',
  preferencesPositionDescription: 'Choose the default split panel position for the service.',
  preferencesPositionSide: 'Side',
  preferencesPositionBottom: 'Bottom',
  preferencesConfirm: 'Confirm',
  preferencesCancel: 'Cancel',
  closeButtonAriaLabel: 'Close panel',
  openButtonAriaLabel: 'Open panel',
  resizeHandleAriaLabel: 'Resize split panel',
};




//-- Encryption
var CryptoJS = require("crypto-js");

function Login() {
  
    //-- Application Version
    const [versionMessage, setVersionMessage] = useState([]);
  
    //-- Variable for Active Tabs
    const [activeTabId, setActiveTabId] = useState("modeIam");
    const currentTabId = useRef("modeIam");


    //-- Variable for Split Panels
    const [splitPanelShow,setsplitPanelShow] = useState(false);
    const [selectedItems,setSelectedItems] = useState([{ identifier: "" }]);
    
    //-- Variables RDS Table
    const [dataRds,setDataRds] = useState([]);
    const columnsRds=[
                    { id: "identifier",header: "Cluster Identifier",cell: item => item['identifier'] || "-",sortingField: "identifier",isRowHeader: true, width: 150, },
                    { id: "status",header: "Status",cell: item => ( <> <StatusIndicator type={item.status === 'available' ? 'success' : 'error'}> {item.status} </StatusIndicator> </> ),sortingField: "status",isRowHeader: true },
                    { id: "size",header: "Size",cell: item => item['size'] || "-",sortingField: "size",isRowHeader: true },
                    { id: "engine",header: "Engine",cell: item => item['engine'] || "-",sortingField: "engine",isRowHeader: true },
                    { id: "shards",header: "Total Shards",cell: item => item['shards'] || "-",sortingField: "shards",isRowHeader: true },
                    { id: "nodes",header: "Total Nodes",cell: item => item['nodes'] || "-",sortingField: "nodes",isRowHeader: true },
                    { id: "mode",header: "Cluster Mode",cell: item => item['mode'] || "-",sortingField: "mode",isRowHeader: true },
                    { id: "multiaz",header: "MultiAz",cell: item => item['multiaz'] || "-",sortingField: "multiaz",isRowHeader: true },
                    { id: "ssl",header: "SSL",cell: item => item['ssl'] || "-",sortingField: "ssl",isRowHeader: true },
                    { id: "auth",header: "AuthMode",cell: item => item['auth'] || "-",sortingField: "auth",isRowHeader: true },
                    ];
    
    
    
    //-- Variable for textbox components
    const [txtUser, settxtUser] = useState('');
    const [txtPassword, settxtPassword] = useState('');
  
    const [modalConnectVisible, setModalConnectVisible] = useState(false);

    //-- Add Header Cognito Token
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    Axios.defaults.withCredentials = true;
    
    //-- Handle Click Events
    const handleClickLogin = () => {
            
            console.log(selectedItems[0]['engine']);
            // Add CSRF Token
            Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");

            // Get Authentication
            Axios.post(`${configuration["apps-settings"]["api_url"]}/api/redis/connection/auth/`,{
                params: { 
                          cluster : selectedItems[0]['identifier'],
                          host: selectedItems[0]['endpoint'], 
                          port: selectedItems[0]['port'], 
                          username: txtUser, 
                          password: txtPassword, 
                          engine: selectedItems[0]['engine'],
                          auth : currentTabId.current,
                          ssl : selectedItems[0]['ssl']
                  
                }
            }).then((data)=>{
                console.log(data);
                if (data.data.result === "auth1") {
                     sessionStorage.setItem(data.data.session_id, data.data.session_token );
                     var userId;
                     switch(currentTabId.current){
                                        
                        case "modeNonAuth":
                                        userId = "NON-AUTH Token";
                                        break;
                                        
                        case "modeAuth":
                                        userId = "AUTH Token";
                                        
                                        break;
                        case "modeAcl":
                                        userId = txtUser;
                                        break;
                          
                     }
                     var session_id = CryptoJS.AES.encrypt(JSON.stringify({
                                                                            session_id : data.data.session_id,
                                                                            rds_id : selectedItems[0]['identifier'],
                                                                            rds_user : userId, 
                                                                            rds_password : txtPassword, 
                                                                            rds_host : selectedItems[0]['endpoint'],
                                                                            rds_port : selectedItems[0]['port'], 
                                                                            rds_engine : selectedItems[0]['engine'],
                                                                            rds_auth : currentTabId.current,
                                                                            rds_ssl : selectedItems[0]['ssl'],
                                                                            rds_status : selectedItems[0]['status'],
                                                                            rds_size : selectedItems[0]['size'],
                                                                            rds_nodes : selectedItems[0]['nodes'],
                                                                            rds_shards : selectedItems[0]['shards'],
                                                                            rds_mode : selectedItems[0]['mode'],
                                                                            rds_multiaz : selectedItems[0]['multiaz']
                                                                            }), 
                                                            data.data.session_id
                                                            ).toString();
                                                                            
                     var path_name = "";
                     switch (selectedItems[0]['engine']) {
                         
                          case "elasticache:redis":
                            path_name = "/sm-elasticache-01";
                            break;
                          
                          default:
                             break;
                            
                          
                    }
                    
                    setModalConnectVisible(false);
                    settxtUser('');
                    settxtPassword('');
                    window.open(path_name + '?' + createSearchParams({
                                session_id: session_id,
                                code_id: data.data.session_id
                                }).toString() ,'_blank');
                    
    
                }
                else {
                 

                }
                  

            })
            .catch((err) => {
                
                console.log('Timeout API Call : /api/redis/connection/auth/');
                console.log(err)
            });
            
            
    };
    
  
    //-- Call API to App Version
   async function gatherVersion (){

        //-- Application Update
        var appVersionObject = await applicationVersionUpdate({ codeId : "dbtop", moduleId: "elasticache"} );
        
        if (appVersionObject.release > configuration["apps-settings"]["release"] ){
          setVersionMessage([
                              {
                                type: "info",
                                content: "New Application version is available, new features and modules will improve monitoring capabilities and user experience.",
                                dismissible: true,
                                dismissLabel: "Dismiss message",
                                onDismiss: () => setVersionMessage([]),
                                id: "message_1"
                              }
          ]);
      
        }
        
   }
   
   
   //-- Call API to gather instances
   async function gatherClusters (){

        //--- GATHER INSTANCES
        var rdsItems=[];
        
        try{
                   
           
            const { data } = await Axios.get(`${configuration["apps-settings"]["api_url"]}/api/aws/region/elasticache/cluster/nodes/`);
            sessionStorage.setItem("x-csrf-token", data.csrfToken );
            data.ReplicationGroups.forEach(function(item) {
                            
                            try{
                                  var endPoint;
                                  var port;
                                  if ( item['ClusterEnabled'] == true) {
                                      
                                      endPoint = item['ConfigurationEndpoint']['Address'];
                                      port = item['ConfigurationEndpoint']['Port'];
                                    
                                  }
                                  else {
                                    
                                      endPoint = item['NodeGroups'][0]['PrimaryEndpoint']['Address'];
                                      port = item['NodeGroups'][0]['PrimaryEndpoint']['Port'];
                                    
                                  }
                                  
                                  var authMode = "";
                                  
                                  if ( String(item['AuthTokenEnabled']) == "true")
                                      authMode = "modeAuth";
                                  
                                  if ( String(item['AuthTokenEnabled']) == "false")
                                  {
                                      if ( String(item["UserGroupIds"]) != "" )
                                          authMode = "modeAcl";
                                      else
                                          authMode = "modeNonAuth";
                                  }
                                      
                                  
                                      
                                  
                                  rdsItems.push({
                                                identifier : item['ReplicationGroupId'],
                                                status : item['Status'] ,
                                                size : item['CacheNodeType'] ,
                                                engine : "elasticache:redis" ,
                                                shards : item['NodeGroups'].length,
                                                nodes: item['MemberClusters'].length,
                                                mode: item['ClusterMode'],
                                                endpoint: endPoint,
                                                port : port,
                                                multiaz : item['MultiAZ'],
                                                ssl : ( String(item['TransitEncryptionMode']) =='required' ? 'required' : '-'),
                                                auth : authMode,
                                                authmode : authMode
                                  });
                                  
                                  
                            }
                            catch{
                              console.log('Timeout API error : /api/aws/region/elasticache/cluster/nodes/');                  
                            }
                            
                   
                          
            })
                                  
            
        }
        catch{
          console.log('Timeout API error : /api/aws/region/elasticache/cluster/nodes/');                  
        }
        
        setDataRds(rdsItems);
        if (rdsItems.length > 0 ) {
          setSelectedItems([rdsItems[0]]);
          setActiveTabId(rdsItems[0]['authmode']);
          currentTabId.current = rdsItems[0]['authmode'];
          setsplitPanelShow(true);
        }

    }
    
    
    //-- Handle Object Events KeyDown
    const handleKeyDowntxtLogin= (event) => {
      if (event.detail.key === 'Enter') {
        handleClickLogin();
      }
    }
    
    
    
    
    
    //-- Init Function
      
    // eslint-disable-next-line
    useEffect(() => {
        gatherClusters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
    useEffect(() => {
        gatherVersion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
  return (
    <div style={{"background-color": "#f2f3f3"}}>
        <CustomHeader/>
        <AppLayout
            breadCrumbs={breadCrumbs}
            navigation={<SideNavigation items={SideMainLayoutMenu} header={SideMainLayoutHeader} activeHref={"/clusters/elasticache/"} />}
            splitPanelOpen={splitPanelShow}
            onSplitPanelToggle={() => setsplitPanelShow(false)}
            splitPanelSize={350}
            splitPanel={
                      <SplitPanel  
                          header={
                          
                              <Header
                                      variant="h3"
                                      actions={
                                              <SpaceBetween
                                                direction="horizontal"
                                                size="xs"
                                              >
                                                <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} onClick={() => {setModalConnectVisible(true);}}>Connect</Button>
                                              </SpaceBetween>
                                      }
                                      
                                    >
                                     {"Instance : " + selectedItems[0].identifier}
                                    </Header>
                            
                          } 
                          i18nStrings={splitPanelI18nStrings} closeBehavior="hide"
                          onSplitPanelToggle={({ detail }) => {
                                        console.log(detail);
                                        }
                                      }
                      >
                          
                                                
                    
                            <ColumnLayout columns="3" variant="text-grid">
                              <div>
                                  <Box variant="awsui-key-label">Cluster Identifier</Box>
                                  {selectedItems[0]['identifier']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Engine</Box>
                                  {selectedItems[0]['engine']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">MultiAZ</Box>
                                  {selectedItems[0]['multiaz']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Total Shards</Box>
                                  {selectedItems[0]['shards']}
                              </div>
                               <div>
                                  <Box variant="awsui-key-label">Total Nodes</Box>
                                  {selectedItems[0]['nodes']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Cluster Mode</Box>
                                  {selectedItems[0]['mode']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Endpoint</Box>
                                  {selectedItems[0]['endpoint']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Port</Box>
                                  {selectedItems[0]['port']}
                              </div>
                              <div>
                                  <Box variant="awsui-key-label">Size</Box>
                                  {selectedItems[0]['size']}
                              </div>
                            
                            </ColumnLayout>
                            
                            
                      </SplitPanel>
            }
            contentType="table"
            content={
                <>
                      <Flashbar items={versionMessage} />
                      <br/>
                      <Table
                          stickyHeader
                          columnDefinitions={columnsRds}
                          items={dataRds}
                          loadingText="Loading records"
                          sortingDisabled
                          variant="embedded"
                          selectionType="single"
                          onSelectionChange={({ detail }) => {
                            setSelectedItems(detail.selectedItems);
                            setsplitPanelShow(true);
                            setActiveTabId(detail.selectedItems[0]['authmode']);
                            currentTabId.current=detail.selectedItems[0]['authmode'];
                            }
                          }
                          selectedItems={selectedItems}
                          empty={
                            <Box textAlign="center" color="inherit">
                              <b>No records</b>
                              <Box
                                padding={{ bottom: "s" }}
                                variant="p"
                                color="inherit"
                              >
                                No records to display.
                              </Box>
                            </Box>
                          }
                        resizableColumns
                        header={
                                    <Header
                                      variant="h3"
                                      counter={"(" + dataRds.length + ")"}
                                      actions={
                                              <SpaceBetween
                                                direction="horizontal"
                                                size="xs"
                                              >
                                                <Button variant="primary" disabled={selectedItems[0].identifier === "" ? true : false} onClick={() => {setModalConnectVisible(true);}}>Connect</Button>
                                                <Button variant="primary" onClick={() => {gatherClusters();}}>Refresh</Button>
                                              </SpaceBetween>
                                      }
                                      
                                    >
                                     Instances
                                    </Header>
                                  }
                                  
          
                        />
                        
                        
                        <Modal
                            onDismiss={() => setModalConnectVisible(false)}
                            visible={modalConnectVisible}
                            closeAriaLabel="Close modal"
                            size="large"
                            footer={
                              <Box float="right">
                                <SpaceBetween direction="horizontal" size="xs">
                                  <Button variant="primary" onClick={() => setModalConnectVisible(false)}>Cancel</Button>
                                  <Button variant="primary" onClick={handleClickLogin}>Connect</Button>
                                </SpaceBetween>
                              </Box>
                            }
                            header={
                                  <Header
                                      variant="h3"
                                  >  
                                         {"Instance : " + selectedItems[0].identifier }
                                  </Header> 
                              
                            }
                          >
                                
                                { activeTabId === "modeAcl" &&
                                <Tabs
                                    onChange={({ detail }) => {
                                          setActiveTabId(detail.activeTabId);
                                          currentTabId.current=detail.activeTabId;
                                      }
                                    }
                                    activeTabId={activeTabId}
                                    tabs={[
                                                {
                                                  label: "ACL Mode - Password Auth",
                                                  id: "modeAcl",
                                                  content: 
                                                          <>
                                                                
                                                                <FormField label="Username">
                                                                  <Input value={txtUser} onChange={event =>settxtUser(event.detail.value)}
                                                                />
                                                                </FormField>
                                                                
                                                                <FormField label="Password">
                                                                  <Input value={txtPassword} onChange={event =>settxtPassword(event.detail.value)} onKeyDown={handleKeyDowntxtLogin}
                                                                         type="password"
                                                                  />
                                                                </FormField>
                                                                
                                                          </>
                                                },
                                                
                                      ]}
                                />
                                }
                                
                                { activeTabId === "modeNonAuth" &&
                                <Tabs
                                    onChange={({ detail }) => {
                                          setActiveTabId(detail.activeTabId);
                                          currentTabId.current=detail.activeTabId;
                                      }
                                    }
                                    activeTabId={activeTabId}
                                    tabs={[
                                                
                                                {
                                                  label: "NON-AUTH Mode",
                                                  id: "modeNonAuth",
                                                  content: 
                                                          <>
                                                                With NON-AUTH Mode you can connect without authenticate a connection to ElastiCache for Redis.
                                                          </>
                                                }
                                                
                                      ]}
                                />
                                }
                                
                                
                                
                                
                                { activeTabId === "modeAuth" &&
                                <Tabs
                                    onChange={({ detail }) => {
                                          setActiveTabId(detail.activeTabId);
                                          currentTabId.current=detail.activeTabId;
                                      }
                                    }
                                    activeTabId={activeTabId}
                                    tabs={[
                                                {
                                                  label: "AUTH Mode",
                                                  id: "modeAuth",
                                                  content: 
                                                          <>
                                                                
                                                                <FormField label="Auth Token">
                                                                  <Input value={txtPassword} onChange={event =>settxtPassword(event.detail.value)} onKeyDown={handleKeyDowntxtLogin}
                                                                         type="password"
                                                                  />
                                                                </FormField>
                                                                
                                                          </>
                                                }
                                                
                                      ]}
                                />
                                }
                                
                                
                          </Modal>
                                                      
                  
                </>
                
            }
          />
        
    </div>
  );
}

export default Login;
