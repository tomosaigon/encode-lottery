import React, { useEffect, useState } from "react";
import { Button } from "baseui/button";
import { Card, StyledAction, StyledBody } from "baseui/card";
import { Input } from "baseui/input";
import { formatEther, parseEther } from "viem";
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
  const [ownerPool, setOwnerPool] = useState(0n);

  useEffect(() => {
    (async () => {
      const data = await publicClient.readContract({
        address: Lottery.address,
        abi: Lottery.abi,
        functionName: "betsOpen",
      });
      setBetsOpen(data);

      setOwnerPool(
        await publicClient.readContract({
          address: Lottery.address,
          abi: Lottery.abi,
          functionName: "ownerPool",
        }),
      );
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

  const { write: ownerWithdrawWrite } = useContractWrite({
    address: Lottery.address,
    abi: Lottery.abi,
    functionName: "ownerWithdraw",
  });

  return (
    <>
      <Card overrides={{ Root: { style: { width: "100%" } } }} title="Open!">
        <StyledBody>
          <p className="">Bets Open: {betsOpen ? "Yes" : "No"}</p>
          <p>The owner can start the lottery over if it is currently closed and ready. </p>
        </StyledBody>
        <StyledAction>
          <Button
            disabled={betsOpen}
            overrides={{
              BaseButton: { style: { width: "100%" } },
            }}
            onClick={() => openBetsWrite()}
          >
            Open Bets for 4 min
          </Button>
        </StyledAction>
      </Card>
      <Card overrides={{ Root: { style: { width: "100%" } } }} title="Withdraw!">
        <StyledBody>
          <p>The owner can collect from the owner pool after lotteries have closed. </p>
          <p>Owner Pool: {formatEther(ownerPool)} WBTC. </p>
          <label htmlFor="numberOfTokens" className="">
            Number of Tokens:
          </label>
          <Input
            type="number"
            id="numberOfTokens"
            value={numberOfTokens}
            onChange={e => setNumberOfTokens(Number(e.target.value))}
          />
        </StyledBody>
        <StyledAction>
          <Button
            overrides={{
              BaseButton: { style: { width: "100%" } },
            }}
            onClick={() => ownerWithdrawWrite?.({ args: [parseEther(numberOfTokens.toString())] })}
          >
            Withdraw Tokens
          </Button>
        </StyledAction>
      </Card>
    </>
  );
};

export default AdminLottery;
