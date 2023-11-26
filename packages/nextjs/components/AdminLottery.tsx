import React, { useEffect, useState } from "react";
// import { formatEther, parseEther } from "viem";
import { useAccount, useContractWrite } from "wagmi";
import { usePublicClient } from "wagmi";
// import { useWalletClient } from "wagmi";
// import deployedContracts from '../deployed-contracts.json';
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

const AdminLottery = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: scaffoldConfig.targetNetwork.id });
  // const { data: walletClient } = useWalletClient();
  const Lottery = deployedContracts[scaffoldConfig.targetNetwork.id].Lottery;

  const [betsOpen, setBetsOpen] = useState<boolean>(false);
  // const [closingTime, setClosingTime] = useState<number>(0);
  const [numberOfTokens, setNumberOfTokens] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const data = await publicClient.readContract({
        address: Lottery.address,
        abi: Lottery.abi,
        functionName: "betsOpen",
      });
      setBetsOpen(data);
    })();
  }, [Lottery, address, publicClient]);

  const currentTimestamp = Date.now();
  const { write: openBetsWrite } = useContractWrite({
    address: Lottery.address,
    abi: Lottery.abi,
    functionName: "openBets",
    // args: [BigInt(currentTimestamp + 10 * 60 * 1000)],
    args: [BigInt(parseInt("" + currentTimestamp / 1000) + 4 * 60)],
  });

  return (
    <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
      <p className="">Bets Open: {betsOpen ? "Yes" : "No"}</p>
      {!betsOpen && (
        <button type="button" className="btn btn-primary w-full mt-4" onClick={() => openBetsWrite()}>
          Open Bets for 4 min
        </button>
      )}
      {betsOpen && (
        <div className="mt-4 space-y-4">
          <label htmlFor="numberOfTokens" className="">
            Number of Tokens:
          </label>
          <input
            type="number"
            id="numberOfTokens"
            className="input input-primary"
            value={numberOfTokens}
            onChange={e => setNumberOfTokens(Number(e.target.value))}
          />
          <button
            type="button"
            className="btn btn-secondary w-full"
            // onClick={handleWithdrawTokens}
          >
            TODO Withdraw Tokens
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLottery;
