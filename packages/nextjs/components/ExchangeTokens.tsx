import React, { useEffect, useState } from "react";
import { Button } from "baseui/button";
import { Card, StyledAction, StyledBody } from "baseui/card";
import { Input } from "baseui/input";
import { formatEther, parseEther } from "viem";
import { useAccount, useContractWrite } from "wagmi";
import { usePublicClient } from "wagmi";
import { useWalletClient } from "wagmi";
// import deployedContracts from '../deployed-contracts.json';
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

const erc20balanceOf = {
  constant: true,
  inputs: [
    {
      name: "_owner",
      type: "address",
    },
  ],
  name: "balanceOf",
  outputs: [
    {
      name: "balance",
      type: "uint256",
    },
  ],
  payable: false,
  stateMutability: "view",
  type: "function",
};
const erc20approve = {
  constant: false,
  inputs: [
    {
      name: "_spender",
      type: "address",
    },
    {
      name: "_value",
      type: "uint256",
    },
  ],
  name: "approve",
  outputs: [
    {
      name: "",
      type: "bool",
    },
  ],
  payable: false,
  stateMutability: "nonpayable",
  type: "function",
};
const erc20allowance = {
  constant: true,
  inputs: [
    {
      name: "_owner",
      type: "address",
    },
    {
      name: "_spender",
      type: "address",
    },
  ],
  name: "allowance",
  outputs: [
    {
      name: "",
      type: "uint256",
    },
  ],
  payable: false,
  stateMutability: "view",
  type: "function",
};

const ExchangeTokens = () => {
  const { address } = useAccount();
  const [spendAmount, setSpendAmount] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [paymentTokenAddress, setPaymentTokenAddress] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState(0n);
  const [tapprovedBalance, setTapprovedBalance] = useState(0n);

  const publicClient = usePublicClient({ chainId: scaffoldConfig.targetNetwork.id });
  const { data: walletClient } = useWalletClient();
  const Lottery = deployedContracts[scaffoldConfig.targetNetwork.id].Lottery;

  useEffect(() => {
    (async () => {
      const data = await publicClient.readContract({
        address: Lottery.address,
        abi: Lottery.abi,
        functionName: "paymentToken",
      });
      setPaymentTokenAddress(data);
      console.log(data);

      if (address) {
        const balanceData = await publicClient.readContract({
          address: data,
          abi: [erc20balanceOf],
          functionName: "balanceOf",
          args: [address],
        });
        console.log(balanceData);
        setTokenBalance(balanceData as bigint);

        const tapprovedBalanceData = await publicClient.readContract({
          address: data,
          abi: [erc20allowance],
          functionName: "allowance",
          args: [address, Lottery.address],
        });
        console.log(tapprovedBalanceData);
        setTapprovedBalance(tapprovedBalanceData as bigint);
      }
    })();
  }, [Lottery, address, publicClient]);
  // const {
  //   data: paymentToken,
  //   isFetching,
  //   refetch,
  // } = useContractRead({
  //   // chainId: getTargetNetwork().id,
  //   functionName: 'paymentToken',
  //   address: Lottery.address,
  //   abi: Lottery.abi,
  //   // watch: true,
  //   // args: [],
  //   // enabled: !Array.isArray(args) || !args.some(arg => arg === undefined),
  //   // ...(readConfig as any),
  // })

  // can't dynamically set value
  // const { config: purchaseTokensConfig } = usePrepareContractWrite({
  //   address: Lottery.address,
  //   abi: Lottery.abi,
  //   functionName: 'purchaseTokens',
  //   value: parseEther(spendAmount.toString()),
  // });
  // const { data, isLoading, isSuccess, write } = useContractWrite(purchaseTokensConfig)
  const { write: purchaseTokensWrite } = useContractWrite({
    address: Lottery.address,
    abi: Lottery.abi,
    functionName: "purchaseTokens",
    // value: parseEther(spendAmount.toString()),
  });

  // const { config: returnTokensConfig } = usePrepareContractWrite({
  //   address: Lottery.address,
  //   abi: Lottery.abi,
  //   functionName: 'returnTokens',
  //   args: [parseEther(amount.toString())],
  // })
  const { write: returnTokensWrite } = useContractWrite({
    address: Lottery.address,
    abi: Lottery.abi,
    functionName: "returnTokens",
    // args: [parseEther(amount.toString())],
  });
  // address: paymentTokenAddress unknown
  // const { write: approveWrite } = useContractWrite({
  //   address: paymentTokenAddress,
  //   abi: [erc20approve],
  //   functionName: 'approve',
  // })
  const approveWrite = async () => {
    if (!paymentTokenAddress) return;
    if (!walletClient) return;
    // XXX broken burner wallet
    const { request } = await publicClient.simulateContract({
      account: address,
      address: paymentTokenAddress,
      abi: [erc20approve],
      functionName: "approve",
      args: [Lottery.address, parseEther(amount.toString())],
    });
    await walletClient.writeContract(request);
  };
  // <div className="flex flex-col bg-base-100 px-10 py-10 max-w-xs rounded-3xl">
  // <div className="flex flex-col bg-base-100 px-10 py-10  ">
  return (
    <>
      <Card>
        <StyledBody>
          Spend your Ether now to acquire our exclusive payment tokens. Just input the desired amount then confirm the
          transaction in your wallet.
          <p className="">Payment Token (WBTC): {paymentTokenAddress}</p>
          <p className="">Balance: {tokenBalance ? formatEther(tokenBalance) : "0"}</p>
          <p className="">Approved: {tapprovedBalance ? formatEther(tapprovedBalance) : "0"}</p>
          <label htmlFor="amount" className="">
            Ether Amount to Spend:
          </label>
          <Input
            type="number"
            id="spentAmount"
            value={spendAmount}
            onChange={e => setSpendAmount(Number(e.target.value))}
          />
        </StyledBody>
        <StyledAction>
          <Button
            overrides={{
              BaseButton: { style: { width: "100%" } },
            }}
            disabled={!purchaseTokensWrite}
            onClick={() =>
              purchaseTokensWrite?.({
                value: parseEther(spendAmount.toString()),
              })
            }
          >
            Buy
          </Button>
        </StyledAction>
      </Card>

      <Card>
        <StyledBody>
          Redeem your payment tokens and convert them back into Ether after approval.
          <label htmlFor="amount" className="">
            Enter Amount to Redeem:
          </label>
          <Input type="number" id="amount" value={amount} onChange={e => setAmount(Number(e.target.value))} />
        </StyledBody>
        <StyledAction>
          <Button
            overrides={{
              BaseButton: { style: { width: "50%" } },
            }}
            onClick={approveWrite}
          >
            Approve
          </Button>
          <Button
            overrides={{
              BaseButton: { style: { width: "50%" } },
            }}
            disabled={!returnTokensWrite}
            onClick={() =>
              returnTokensWrite?.({
                args: [parseEther(amount.toString())],
              })
            }
          >
            Redeem
          </Button>
        </StyledAction>
      </Card>
    </>
  );
};

export default ExchangeTokens;
