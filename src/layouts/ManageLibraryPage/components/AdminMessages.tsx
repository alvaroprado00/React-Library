import { useOktaAuth } from "@okta/okta-react"
import { useEffect, useState } from "react";
import MessageModel from "../../../models/MessageModel";
import { SpinnerLoading } from "../../Utils/SpinnerLoading";
import { Pagination } from "../../Utils/Pagination";
import { AdminMessage } from "./AdminMessage";
import AdminRequestModel from "../../../models/AdminRequestModel";

export const AdminMessages =()=>{

    //Authentication
    const {authState} = useOktaAuth();

    //Messages
    const [messages, setMessages]= useState<MessageModel[]>([]);
    const [isLoading, setIsLoading]= useState(true);
    const [httpError, setHttpError] =useState(null);

    //Pagination
    const [currentPage, setCurrentPage]= useState(1);
    const [totalPages, setTotalPages]=useState(0);
    const [messagesPerPage, setMessagesPerPage]=useState(5);

    //Recall useEffect

    const [btnSubmit, setBtnSubmit] =useState(false);


    function paginate (pageNumber:number){ setCurrentPage(pageNumber)};

    async function submitResponse(id:number, response:string) {

        if(authState && authState.isAuthenticated && id!==null && response!==''){

            const url =`http://localhost:8080/api/messages/secure/answer/message`;
            const answer = new AdminRequestModel(id, response);
            const requestOptions={
                method:'PUT',
                headers:{
                    Authorization:`Bearer ${authState?.accessToken?.accessToken}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(answer),
            }

            const submitResponseResult = await fetch(url, requestOptions);

            if(!submitResponseResult.ok){
                throw new Error('Error when submitin response');
            }

            setBtnSubmit(!btnSubmit);
        }
        
    }

    useEffect(()=>{

        const fetchMessages = async ()=>{
            if(authState && authState.accessToken){

                const url = `http://localhost:8080/api/messages/search/findByClosed?closed=false&page=${currentPage-1}&size=${messagesPerPage}`;
                const requestOptions={
                    method:'GET',
                    headers:{
                        Authorization:`Bearer ${authState.accessToken?.accessToken}`,
                        'Content-Type':'application/json',
                    }
                }

                const messagesResponse = await fetch(url, requestOptions);

                if(!messagesResponse.ok){
                    throw new Error('Something went wrong when fetching open questions');
                }

                const messagesResponseJson = await messagesResponse.json();
                setTotalPages(messagesResponseJson.page.totalPages);
                setMessages(messagesResponseJson._embedded.messages);
            }

            setIsLoading(false);
        }
        
        fetchMessages().catch((error:any)=>{
            setIsLoading(false);
            setHttpError(error.message)
        })
        window.scrollTo(0,0);
        
    },[authState, currentPage, btnSubmit]);

    if(isLoading){
        return(
            <SpinnerLoading/>
        );
    }

    if(httpError){
        return(
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        );
    }

    return(
        <div className="mt-3">
            {
                messages.length > 0 ?
                <>
                    <h5>Pending Q/A: </h5>
                    {messages.map(message=>(
                        <AdminMessage message={message} submitResponse={submitResponse}/>
                    ))}
             
                </>
                :
                <h5>No pending Q/A</h5>
            }
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate}/>}
        </div>
    );
}