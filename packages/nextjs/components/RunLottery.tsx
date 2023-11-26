import React, { useEffect, useState } from "react";
// import { formatEther, parseEther } from "viem";
import { useAccount, useContractWrite } from "wagmi";
import { usePublicClient } from "wagmi";
// import { useWalletClient } from "wagmi";
// import deployedContracts from '../deployed-contracts.json';
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

const RunLottery = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: scaffoldConfig.targetNetwork.id });
  // const { data: walletClient } = useWalletClient();
  const Lottery = deployedContracts[scaffoldConfig.targetNetwork.id].Lottery;

  const [betsOpen, setBetsOpen] = useState<boolean>(false);
  const [betsClosingTime, setBetsClosingTime] = useState<bigint>(0n);

  useEffect(() => {
    (async () => {
      const data = await publicClient.readContract({
        address: Lottery.address,
        abi: Lottery.abi,
        functionName: "betsOpen",
      });
      setBetsOpen(data);

      setBetsClosingTime(
        await publicClient.readContract({
          address: Lottery.address,
          abi: Lottery.abi,
          functionName: "betsClosingTime",
        }),
      );
    })();
  }, [Lottery, address, publicClient]);

  const isBeforeClosingTime = new Date().getTime() / 1000 < betsClosingTime;

  const { write: closeLotteryWrite } = useContractWrite({
    address: Lottery.address,
    abi: Lottery.abi,
    functionName: "closeLottery",
  });

  return (
    <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
      <p className="">{betsOpen ? "Lottery is still open." : "Lottery is already closed."}</p>
      <p className="">{isBeforeClosingTime ? "Too soon to close" : "OK to close"}</p>
      {!isBeforeClosingTime && betsOpen && (
        <button type="button" className="btn btn-primary w-full mt-4" onClick={() => closeLotteryWrite()}>
          Run (Close) Lottery
        </button>
      )}
    </div>
  );
};

export default RunLottery;
