import React, { useEffect, useState } from "react";
import { Button } from "baseui/button";
import { Card, StyledAction, StyledBody } from "baseui/card";
import { formatEther } from "viem";
import { useAccount, useContractWrite } from "wagmi";
import { usePublicClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

const ClaimPrize = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: scaffoldConfig.targetNetwork.id });
  const [prizeAmount, setPrizeAmount] = useState<bigint>(0n);
  const Lottery = deployedContracts[scaffoldConfig.targetNetwork.id].Lottery;

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        setPrizeAmount(
          await publicClient.readContract({
            address: Lottery.address,
            abi: Lottery.abi,
            functionName: "prize",
            args: [address],
          }),
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, [Lottery, address, publicClient]);

  const { write: prizeWithdrawWrite } = useContractWrite({
    address: Lottery.address,
    abi: Lottery.abi,
    functionName: "prizeWithdraw",
  });

  return (
    <Card>
      <StyledBody>
        Congratulations on being a winner!
        <p>You won {formatEther(prizeAmount)} WBTC. </p>
        To claim your prize, simply click the button below and confirm the transaction in your wallet. It is that easy!
        <p>Thank you for being a valued gambler, and enjoy your well-deserved reward.</p>
        <p className="">Prize Amount: {formatEther(prizeAmount)} WBTC</p>
      </StyledBody>
      <StyledAction>
        <Button
          overrides={{
            BaseButton: { style: { width: "100%" } },
          }}
          onClick={() => prizeWithdrawWrite?.({ args: [prizeAmount] })}
        >
          Claim Prize
        </Button>
      </StyledAction>
    </Card>
  );
};

export default ClaimPrize;
