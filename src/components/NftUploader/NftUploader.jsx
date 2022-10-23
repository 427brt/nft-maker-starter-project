// NftUploader.jsx
import Web3Mint from "../../utils/Web3Mint.json"
import { Web3Storage } from 'web3.storage';
import { ethers } from "ethers";
import { Button } from "@mui/material";
import React from "react";
import { useEffect, useState } from 'react';
import ImageLogo from "./image.svg";
import "./NftUploader.css";
import githubLogo from "../assets/github-logo.svg";

const GITHUB_HANDLE = "427brt";
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}`;


const NftUploader = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  //ネットワークの確認
  const [isNetwork, setIsNetwork] = useState(false);
  //loading
  const [loading, setLoading] = useState(true);
  console.log("currentAccount: ", currentAccount);
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      //networkの確認
      let chainId = await ethereum.request({method : "eth_chainId"});
      console.log("Connected to chain " + chainId);
      //goerliのIDは5
      const goerliChainId = "0x5";
      if(chainId !== goerliChainId) {
        setIsNetwork(false);
        alert("You are not connected to the Goerli Test Network.");
      }
      if(chainId === goerliChainId) {
        setIsNetwork(true);
      }

    } else {
      console.log("No authorized account found");
    }
  };


  const connectWallet = async () =>{
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      //ウォレットアドレスに対してアクセスをリクエスト
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      console.log("Connected", accounts[0]);

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async (ipfs) => {
    const CONTRACT_ADDRESS = "0x7610617D8b8A23Eca17C0752Cb230Da6E74B271D";
    try {
      setLoading(true);
      const { ethereum } = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, Web3Mint.abi, signer);
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.mintIpfsNFT("sample", ipfs);
        console.log("Mining...please wait");
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);
        
        //loading解除
        setLoading(false);
      } else {
        setLoading(false);
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error){
      setLoading(false);
      console.log(error);
    }
  };

  const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFhNkM1NTAyM2IwNWFEMTQ0RDY1M2JCMkM5NUE5ZGFjQkQ5OTQ1ZEYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjY0NjcyMDM5MjUsIm5hbWUiOiJuZnRfbWFrZXIifQ.gKtCBCWlOPO4BbDh-A0Cj0bjV_7HjluqI8_fIRluEeg";

  const imageToNFT = async (e) => {
    const client = new Web3Storage({ token: API_KEY});
    const image = e.target;
    console.log(image);

    const rootCid = await client.put(image.files, {
      name: 'experiment',
      maxRetries: 3
    });
    const res = await client.get(rootCid)  //web3response
    const files = await res.files()  //web3file[]
    for(const file of files) {
      console.log("file.cid:", file.cid);
      askContractToMintNft(file.cid);
    }
  };


  const renderNotConnectedContainer = () => (
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect to Wallet
      </button>
  );

  useEffect(() => {
    setLoading(true);
    checkIfWalletIsConnected();
    setLoading(false);
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Make NFT</p>
          <p className="sub-text">  Create NFT from your images!🦄</p>
          {currentAccount === "" ? (
        renderNotConnectedContainer()
      ) : (
        <p className="desc">If you choose image, you can mint your NFT</p>
      )}
          <div className="outerBox">
          {/*条件付きレンダリング。
          // すでにウォレット接続されている場合は、
          // Mint NFT を表示する。*/}
      <div className="title">
        <h2>NFT Uploader</h2>
        {!isNetwork ? (
            <p className="sub-text animate-pluse text-orange-500">
              You are not in Goerli Network !
            </p>
          ) : (
            <p className="sub-text text-green-500">
              
            </p>
          )}
      </div>
      <div className="nftUplodeBox">
      <input className="cta-button nftUploadInput" multiple name="imageURL" type="file" accept=".jpg , .jpeg , .png" onChange={imageToNFT}/>
        <div className="imageLogoAndText">
          <img src={ImageLogo} alt="imagelogo" />
          <p>Drag & Drop</p>
        </div>
        
      </div>
      <p>or</p>
      <Button variant="contained">
        choose files
        <input className="cta-button nftUploadInput" type="file" accept=".jpg , .jpeg , .png" onChange={imageToNFT}/>
      </Button>

          {loading ? (
            <p className="sub-text animate-pluse text-green-500">
              Loading...
            </p>
          ) : (
            <p className="sub-text text-blue-500">
              
            </p>
          )}
        </div>
        <div className="footer-container">
          <img alt="GitHub Logo" className="github-logo" src={githubLogo} />
          <a
            className="footer-text"
            href={GITHUB_LINK}
            target="_blank"  //別タブ
            rel="noreferrer"
          >{`built on @${GITHUB_HANDLE}`}</a>
        </div>
        </div>
      </div>
    </div>
  );
};

export default NftUploader;