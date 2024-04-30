const cron = require('node-cron');
const userService = require('../dbService/user.service');

cron.schedule('* * * * *', async () => {
	const emails = (``).split('\n');
	let amount = 200000
    let count = 0
    console.log(emails.length);
	for(let i=0;i<emails.length;i++) {
		const userDetails = await userService.isEmailExist(emails[i].trim());
		if(userDetails) {
            console.log(emails[i]);
            count++
            await userService.walletData(userDetails.id)
            await userService.addWalletHistory({
                amount,
                transaction_type: 'credit',
                user_id: userDetails.id,
            });
			await userService.deductMctFromWallet(userDetails.id, {token_balance: amount});
		}
	}
    console.log(count);
});
