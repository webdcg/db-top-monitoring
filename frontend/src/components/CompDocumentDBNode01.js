import { useState, useEffect, useRef, memo } from 'react'
import Axios from 'axios';
import ChartLine02 from './ChartLine02';
import ChartRadialBar01 from './ChartRadialBar01';

import CompMetric01 from './Metric01';
import CompMetric04 from './Metric04';
import { configuration } from './../pages/Configs';
import Badge from "@cloudscape-design/components/badge";
import Link from "@cloudscape-design/components/link";
import Box from "@cloudscape-design/components/box";
import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";


const ComponentObject = memo(({  sessionId, clusterId, nodeStats }) => {

    const [detailsVisible, setDetailsVisible] = useState(false);
    const detailsVisibleState = useRef(false);
    const activeSessions = useRef([]);
    
    const dataSessionColumns=[
                    { id: "opid",header: "PID",cell: item => item['opid'] || "-",sortingField: "opid",isRowHeader: true },
                    { id: "$db",header: "Database",cell: item => item['$db'] || "-",sortingField: "$db",isRowHeader: true },
                    { id: "client",header: "Host",cell: item => item['client'] || "-",sortingField: "client",isRowHeader: true },
                    { id: "WaitState",header: "WaitType",cell: item => item['WaitState'] || "-",sortingField: "WaitState",isRowHeader: true },
                    { id: "secs_running",header: "ElapsedTime(sec)",cell: item => item['secs_running'] || "-",sortingField: "secs_running",isRowHeader: true },
                    { id: "ns",header: "Namespace",cell: item => item['ns'] || "-",sortingField: "ns",isRowHeader: true },
                    { id: "op",header: "Operation",cell: item => item['op'] || "-",sortingField: "op",isRowHeader: true },
                    { id: "command",header: "Command",cell: item => JSON.stringify(item['command']) || "-",sortingField: "command",isRowHeader: true },
                    ];
   
   
    
    //-- Function Gather RealTime Metrics
    async function fetchSessions() {
        //--- API Call Gather Sessions
        if (detailsVisibleState.current == true) {
                var api_params = {
                              connectionId: sessionId,
                              clusterId : clusterId,
                              instanceId : nodeStats.name,
                              command : { currentOp: 1 }
                              };
                
                Axios.get(`${configuration["apps-settings"]["api_url"]}/api/documentdb/cluster/command/`,{
                      params: api_params
                      }).then((data)=>{
                        
                          activeSessions.current = data.data.inprog;
                          
                      })
                      .catch((err) => {
                          console.log('Timeout API Call : /api/documentdb/cluster/command/' );
                          console.log(err)
                      });
                
                console.log("gather active sessions");      
            
        }
        else {
                activeSessions.current = [];
        }
    
    }
    
    

    function onClickNode() {

        detailsVisibleState.current = (!(detailsVisibleState.current));
        setDetailsVisible(detailsVisibleState.current);
        fetchSessions();
    }


    useEffect(() => {
        const id = setInterval(fetchSessions, configuration["apps-settings"]["refresh-interval-documentdb-sessions"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <>
            <tr>
                <td style={{"width":"10%", "text-align":"left", "border-top": "1pt solid #595f69"}} >  
                     N{nodeStats.nodeId+1} &nbsp;
                    { nodeStats.role === "P" &&
                        <Badge color="blue"> P </Badge>
                    }
                    { nodeStats.role === "R" &&
                        <Badge color="red"> R </Badge>
                    }
                    &nbsp;
                    <Link  fontSize="body-s" onFollow={() => onClickNode()}>{nodeStats.name}</Link>
                </td>
                <td style={{"width":"5%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                   {nodeStats.status}
                </td>
                <td style={{"width":"6%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                   {nodeStats.size}
                </td>
                <td style={{"width":"6%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                   {nodeStats.az}
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                     <CompMetric04
                        value={ (nodeStats.opsInsert + nodeStats.opsQuery + nodeStats.opsUpdate + nodeStats.opsDelete + nodeStats.opsCommand ) || 0}
                        precision={0}
                        format={1}
                        height={"30px"}
                        width={"100px"}
                        history={20}
                        type={"line"}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                        chartColorLine={"#D69855"}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                    <CompMetric01 
                        value={ (nodeStats.docsDeleted + nodeStats.docsInserted + nodeStats.docsReturned + nodeStats.docsUpdated ) || 0}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                    <CompMetric01 
                        value={nodeStats.connectionsCurrent}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                    <CompMetric01 
                        value={nodeStats.connectionsCreated}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                    <CompMetric01 
                        value={nodeStats.cpu}
                        title={""}
                        precision={2}
                        format={1}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                    <CompMetric01 
                        value={nodeStats.memory}
                        title={""}
                        precision={0}
                        format={2}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                    <CompMetric01 
                        value={nodeStats.ioreads + nodeStats.iowrites}
                        title={""}
                        precision={0}
                        format={3}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
                <td style={{"width":"9%", "text-align":"center", "border-top": "1pt solid #595f69"}}>
                    <CompMetric01 
                        value={ (nodeStats.netin + nodeStats.netout) }
                        title={""}
                        precision={0}
                        format={2}
                        fontSizeValue={"14px"}
                        fontColorValue={configuration.colors.fonts.metric100}
                    />
                </td>
            </tr>
            
            { detailsVisible === true &&
            <tr>
                <td></td>
                <td colspan="11" style={{"padding-left": "2em", "border-left": "1px solid " + configuration.colors.lines.separator100 }}>
                        <br/>
                        <br/>
                        
                        <table style={{"width":"100%"}}>
                            <tr>  
                                <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={ (nodeStats.opsInsert + nodeStats.opsQuery + nodeStats.opsUpdate + nodeStats.opsDelete + nodeStats.opsCommand ) || 0}
                                            title={"Operations/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"24px"}
                                        />
                                </td>
                                 <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={ (nodeStats.opsInsert + nodeStats.opsUpdate + nodeStats.opsDelete  ) || 0}
                                            title={"WriteOps/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                        <br/>        
                                        <br/> 
                                        <CompMetric01 
                                            value={ ( nodeStats.opsQuery  ) || 0 }
                                            title={"ReadOps/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                </td>
                                <td style={{"width":"14%", "padding-left": "1em"}}>  
                                        <ChartRadialBar01 series={JSON.stringify([Math.round(nodeStats.cpu || 0)])} 
                                                 height="180px" 
                                                 title={"CPU (%)"}
                                        />
                                     
                                </td>
                                <td style={{"width":"22%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.cpu
                                                            
                                                        ])} 
                                                        title={"CPU Usage (%)"} height="180px" 
                                    />
                                </td>
                                <td style={{"width":"22%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.ioreads,
                                                            nodeStats.history.iowrites
                                                            
                                                        ])} 
                                                        title={"IOPS"} height="180px" 
                                    />
                                </td>
                                <td style={{"width":"22%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.netin,
                                                            nodeStats.history.netout
                                                        ])} 
                                                        title={"NetworkTraffic"} height="180px" 
                                    />  
                                </td>
                            </tr>
                        </table> 
                        <br />
                        <br />
                        <br />
                        <table style={{"width":"100%"}}>
                                <tr> 
                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={ nodeStats.opsInsert  || 0}
                                            title={"opsInsert/sec"}
                                            precision={0}
                                            format={3}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.opsQuery}
                                            title={"opsSelect/sec"}
                                            precision={0}
                                            format={3}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.opsDelete  || 0}
                                            title={"opsDelete/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.opsUpdate || 0}
                                            title={"opsUpdate/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.opsGetmore || 0}
                                            title={"opsGetmore/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.opsCommand || 0}
                                            title={"opsCommand/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.docsInserted || 0}
                                            title={"docsInserted/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.docsDeleted || 0}
                                            title={"docsDeleted/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.docsUpdated || 0}
                                            title={"docsUpdated/sec"}
                                            precision={0}
                                            format={2}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.docsReturned || 0}
                                            title={"docsReturned/sec"}
                                            precision={0}
                                            format={2}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                </tr>
                        </table>
                        <br/>
                        <br/>
                        <table style={{"width":"100%"}}>
                                <tr> 
                                    <td style={{"width":"10%", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={ nodeStats.connectionsCurrent  || 0}
                                            title={"Connections"}
                                            precision={0}
                                            format={3}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.connectionsAvailable || 0}
                                            title={"ConnectionsAvailable"}
                                            precision={0}
                                            format={3}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.connectionsCreated  || 0}
                                            title={"Connections/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.transactionsActive || 0}
                                            title={"transActive"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.transactionsCommited || 0}
                                            title={"transCommited/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.transactionsAborted || 0}
                                            title={"transAborted/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.ioreads || 0}
                                            title={"IO Reads/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.iowrites || 0}
                                            title={"IO Writes/sec"}
                                            precision={0}
                                            format={1}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.netin || 0}
                                            title={"Network-In"}
                                            precision={0}
                                            format={2}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                    <td style={{"width":"10%", "border-left": "2px solid red", "padding-left": "1em"}}>  
                                        <CompMetric01 
                                            value={nodeStats.netout || 0}
                                            title={"Network-Out"}
                                            precision={0}
                                            format={2}
                                            fontColorValue={configuration.colors.fonts.metric100}
                                            fontSizeValue={"16px"}
                                        />
                                    </td>
                                </tr>
                        </table>  
                        <br/>
                        <br/>
                        <br />
                        <br />
                        
                        <table style={{"width":"100%"}}>
                              <tr>  
                                <td style={{"width":"33%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.connectionsCurrent
                                                        ])} 
                                                        title={"Connections"} height="180px" 
                                    />  
                                </td>
                                <td style={{"width":"33%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.opsInsert,
                                                            nodeStats.history.opsQuery,
                                                            nodeStats.history.opsUpdate,
                                                            nodeStats.history.opsDelete,
                                                            nodeStats.history.opsGetmore,
                                                            nodeStats.history.opsCommand
                                                            
                                                        ])} 
                                                        title={"Operations/sec"} height="180px" 
                                    />  
                                </td>
                                <td style={{"width":"33%", "padding-left": "1em"}}>  
                                     <ChartLine02 series={JSON.stringify([
                                                            nodeStats.history.docsDeleted,
                                                            nodeStats.history.docsInserted,
                                                            nodeStats.history.docsReturned,
                                                            nodeStats.history.docsUpdated,
                                                            
                                                        ])} 
                                                        title={"DocumentOps/sec"} height="180px" 
                                    />
                                </td>
                                
                              </tr>
                        </table>
                        <br />
                        <br />
                        <br />
                        
                        <table style={{"width":"100%"}}>
                            <tr>  
                                <td style={{"padding-left": "1em"}}>  

                                    <div style={{"overflow-y":"scroll", "overflow-y":"auto", "height": "450px"}}>  
                                        <Table
                                            stickyHeader
                                            columnDefinitions={dataSessionColumns}
                                            items={activeSessions.current}
                                            loadingText="Loading records"
                                            sortingDisabled
                                            variant="embedded"
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
                                            filter={
                                             <Header variant="h3" counter={"(" +  activeSessions.current.length + ")"}
                                              >
                                                Active sessions
                                            </Header>
                                            }
                                          resizableColumns
                                          />
                                     </div> 
                                </td>  
                            </tr>  
                        </table>  
                        <br />
                        <br />

                </td>
            </tr>
            
            }
            
            
            
            </>
    )
});

export default ComponentObject;
