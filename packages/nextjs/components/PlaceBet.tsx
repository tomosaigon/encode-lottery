import React, { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useContractWrite } from "wagmi";
import { usePublicClient } from "wagmi";
import { useWalletClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

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

const PlaceBet = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: scaffoldConfig.targetNetwork.id });
  const { data: walletClient } = useWalletClient();

  const [paymentTokenAddress, setPaymentTokenAddress] = useState<string | null>(null);

  const [purchaseRatio, setPurchaseRatio] = useState<bigint>(0n);
  const [betPrice, setBetPrice] = useState<bigint>(0n);
  const [betFee, setBetFee] = useState<bigint>(0n);
  const [prizePool, setPrizePool] = useState<bigint>(0n);
  const [ownerPool, setOwnerPool] = useState<bigint>(0n);
  const [betsClosingTime, setBetsClosingTime] = useState<bigint>(0n);
  const [numberOfTimes, setNumberOfTimes] = useState<number>(1);
  const [betsOpen, setBetsOpen] = useState<boolean>(false);

  const Lottery = deployedContracts[scaffoldConfig.targetNetwork.id].Lottery;

  const { write: betManyWrite } = useContractWrite({
    address: Lottery.address,
    abi: Lottery.abi,
    functionName: "betMany",
  });

  const approveWrite = async () => {
    if (!paymentTokenAddress) return;
    if (!walletClient) return;
    // XXX broken burner wallet
    const { request } = await publicClient.simulateContract({
      account: address,
      address: paymentTokenAddress,
      abi: [erc20approve],
      functionName: "approve",
      args: [Lottery.address, (betPrice + betFee) * BigInt(numberOfTimes)],
    });
    await walletClient.writeContract(request);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await publicClient.readContract({
          address: Lottery.address,
          abi: Lottery.abi,
          functionName: "paymentToken",
        });
        setPaymentTokenAddress(data);

        setPurchaseRatio(
          await publicClient.readContract({
            address: Lottery.address,
            abi: Lottery.abi,
            functionName: "purchaseRatio",
          }),
        );

        setBetPrice(
          await publicClient.readContract({
            address: Lottery.address,
            abi: Lottery.abi,
            functionName: "betPrice",
          }),
        );

        setBetFee(
          await publicClient.readContract({
            address: Lottery.address,
            abi: Lottery.abi,
            functionName: "betFee",
          }),
        );

        setPrizePool(
          await publicClient.readContract({
            address: Lottery.address,
            abi: Lottery.abi,
            functionName: "prizePool",
          }),
        );

        setOwnerPool(
          await publicClient.readContract({
            address: Lottery.address,
            abi: Lottery.abi,
            functionName: "ownerPool",
          }),
        );

        setBetsOpen(
          await publicClient.readContract({
            address: Lottery.address,
            abi: Lottery.abi,
            functionName: "betsOpen",
          }),
        );

        setBetsClosingTime(
          await publicClient.readContract({
            address: Lottery.address,
            abi: Lottery.abi,
            functionName: "betsClosingTime",
          }),
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [Lottery, address, publicClient]);

  return (
    <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
      <div className="mb-4">
        <p>Purchase Ratio: {purchaseRatio.toString()}</p>
        <p>Bet Price: {formatEther(betPrice)}</p>
        <p>Bet Fee: {formatEther(betFee)}</p>
        <p>Prize Pool: {formatEther(prizePool)}</p>
        <p>Owner Pool: {formatEther(ownerPool)}</p>
        <p>Bets Open: {betsOpen ? "Yes" : "No"}</p>
        <p>Bets Closing Time: {new Date(1000 * Number(betsClosingTime)).toLocaleString()}</p>
      </div>
      <form className="space-y-4">
        <div className="flex items-center space-x-4">
          <label htmlFor="numberOfTimes" className="">
            Number of Times to Bet:
          </label>
          <input
            type="number"
            id="numberOfTimes"
            className="input input-primary"
            value={numberOfTimes}
            onChange={e => setNumberOfTimes(Number(e.target.value))}
          />
        </div>
        <button type="button" className="btn btn-primary w-full" onClick={() => approveWrite()}>
          Approve {formatEther((betPrice + betFee) * BigInt(numberOfTimes))}
        </button>
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={() => betManyWrite?.({ args: [BigInt(numberOfTimes)] })}
        >
          Place Bet
        </button>
      </form>
    </div>
  );
};

export default PlaceBet;
