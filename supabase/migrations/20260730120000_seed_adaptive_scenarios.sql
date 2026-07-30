/*
# Sentinel India — Seed Adaptive Assessment Scenarios

## Overview
Seeds 4+ non-core (adaptive) scenarios so `buildAssessment` can select
core 8 + adaptive 4 = 12 scenarios per participant. Varied categories
and difficulties; each has 4 options matching the core seed pattern.

## Scenarios (is_core = false)
1. Phishing — Fake KYC email (difficulty 1)
2. Investment — Crypto airdrop Telegram (difficulty 3)
3. Authority — Income-tax refund SMS (difficulty 2)
4. Urgency — Job-offer OTP rush (difficulty 4)
5. Social — Romance / relationship bait (difficulty 2) — extra pool depth
*/

DO $$
DECLARE
  s_phish uuid;
  s_invest uuid;
  s_auth uuid;
  s_urg uuid;
  s_social uuid;
  existing_count int;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM scenarios
  WHERE is_core = false AND is_active = true;

  IF existing_count >= 4 THEN
    RAISE NOTICE 'Adaptive scenarios already seeded (%), skipping', existing_count;
    RETURN;
  END IF;

  -- 1. PHISHING (easy) — Fake KYC email
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'phishing', 'email',
    'Urgent KYC Update Email',
    'You receive an email: "Your UPI KYC will expire in 24 hours. Update now to avoid account suspension: http://upi-kyc-update.co.in/verify". The sender looks similar to your bank but the domain is unfamiliar.',
    'You receive an email saying your UPI KYC will expire in 24 hours and asking you to update now through a link to avoid account suspension. The sender looks similar to your bank but the domain is unfamiliar.',
    false, 1, ARRAY['email', 'kyc', 'phishing', 'upi'], 11
  ) RETURNING id INTO s_phish;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_phish, 'Delete the email. Open my bank or UPI app directly and check KYC status there.', 'safe',
     '{"digitalLiteracy": 3, "verificationHabit": 3, "urgencySusceptibility": -2, "trustCalibration": 2}', 'Correct: Never use links from unexpected KYC emails. Verify only inside official apps.', 1),
    (s_phish, 'Forward the email to my bank support address from their website and ask if it is real.', 'cautious',
     '{"digitalLiteracy": 2, "verificationHabit": 2, "urgencySusceptibility": -1}', 'Partially correct: Checking with the bank is good, but do not click any links in the original email.', 2),
    (s_phish, 'Click the link and enter my Aadhaar and bank details to update KYC quickly.', 'risky',
     '{"digitalLiteracy": -2, "verificationHabit": -3, "urgencySusceptibility": 2, "trustCalibration": -2}', 'Risky: Fake KYC links steal credentials and identity documents.', 3),
    (s_phish, 'Click the link, complete the form, and also share the OTP that arrives on my phone.', 'critical',
     '{"digitalLiteracy": -3, "verificationHabit": -3, "urgencySusceptibility": 3, "trustCalibration": -3}', 'Critical: Sharing OTP with a phishing site hands over account control.', 4);

  -- 2. INVESTMENT (hard) — Crypto airdrop
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'investment', 'social',
    'Telegram Crypto Airdrop',
    'A Telegram bot messages: "Congratulations! You qualified for a government-backed crypto airdrop worth 2 lakh rupees. Connect your wallet and pay a small gas fee of 999 rupees to claim."',
    'A Telegram bot messages saying you qualified for a government-backed crypto airdrop worth 2 lakh rupees. It asks you to connect your wallet and pay a small gas fee of 999 rupees to claim.',
    false, 3, ARRAY['telegram', 'crypto', 'airdrop', 'investment'], 12
  ) RETURNING id INTO s_invest;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_invest, 'Ignore and block the bot. Legitimate airdrops never require upfront fees.', 'safe',
     '{"digitalLiteracy": 3, "aiScamAwareness": 3, "trustCalibration": 2, "urgencySusceptibility": -2}', 'Correct: Fee-to-claim airdrops are classic crypto scams.', 1),
    (s_invest, 'Ask friends who invest in crypto whether this airdrop is known before acting.', 'cautious',
     '{"digitalLiteracy": 1, "verificationHabit": 2, "aiScamAwareness": 1}', 'Partially correct: Seeking advice helps, but connecting a wallet to unknown bots is still unsafe.', 2),
    (s_invest, 'Pay the 999 rupee gas fee since the reward is much larger.', 'risky',
     '{"digitalLiteracy": -2, "trustCalibration": -2, "aiScamAwareness": -2, "urgencySusceptibility": 2}', 'Risky: You pay and never receive funds; scammers may also drain the connected wallet.', 3),
    (s_invest, 'Connect my main wallet, pay the fee, and share seed phrase if the bot asks for verification.', 'critical',
     '{"digitalLiteracy": -3, "trustCalibration": -3, "aiScamAwareness": -3, "verificationHabit": -3}', 'Critical: Sharing a seed phrase permanently compromises the wallet.', 4);

  -- 3. AUTHORITY (moderate) — Tax refund SMS
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'authority', 'sms',
    'Income Tax Refund SMS',
    'You get an SMS: "IT Dept: Refund of Rs 18,450 is pending. Submit bank details within 48 hours or refund will be cancelled. Link: http://incometax-refund-gov.in"',
    'You get a text message claiming the Income Tax Department has a refund of 18,450 rupees pending. It asks you to submit bank details within 48 hours or the refund will be cancelled, and provides a link.',
    false, 2, ARRAY['sms', 'tax', 'authority', 'refund'], 13
  ) RETURNING id INTO s_auth;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_auth, 'Do not click. Log in only at the official incometax.gov.in portal if I expect a refund.', 'safe',
     '{"authoritySusceptibility": -3, "verificationHabit": 3, "digitalLiteracy": 2, "trustCalibration": 2}', 'Correct: Tax authorities do not collect bank details via SMS links.', 1),
    (s_auth, 'Call the income tax helpline from the official website to ask about the message.', 'cautious',
     '{"authoritySusceptibility": -1, "verificationHabit": 2, "digitalLiteracy": 1}', 'Partially correct: Verifying via official channels is good; avoid the SMS link entirely.', 2),
    (s_auth, 'Open the link and enter my PAN and account number to claim the refund.', 'risky',
     '{"authoritySusceptibility": 2, "verificationHabit": -2, "trustCalibration": -2}', 'Risky: Fake tax portals harvest PAN and banking credentials.', 3),
    (s_auth, 'Enter all details plus the OTP I receive so the refund processes faster.', 'critical',
     '{"authoritySusceptibility": 3, "verificationHabit": -3, "trustCalibration": -3, "urgencySusceptibility": 2}', 'Critical: OTP sharing lets scammers access linked accounts.', 4);

  -- 4. URGENCY (hard) — Job offer OTP
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'urgency', 'call',
    'Dream Job Offer Needs OTP',
    'A recruiter calls: "You are selected for a remote role paying 80,000 per month. We must verify your identity in the next 10 minutes. Please read me the OTP we just sent to your phone."',
    'A recruiter calls saying you are selected for a remote role paying 80,000 per month. They say they must verify your identity in the next 10 minutes and ask you to read them the OTP they just sent to your phone.',
    false, 4, ARRAY['call', 'job', 'otp', 'urgency'], 14
  ) RETURNING id INTO s_urg;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_urg, 'Hang up. Real employers never ask for OTPs. Do not share the code with anyone.', 'safe',
     '{"urgencySusceptibility": -3, "verificationHabit": 3, "trustCalibration": 3, "digitalLiteracy": 2}', 'Correct: OTP requests under job-offer pressure are account-takeover scams.', 1),
    (s_urg, 'Ask for the company name and HR email, then hang up and verify independently.', 'cautious',
     '{"urgencySusceptibility": -1, "verificationHabit": 2, "trustCalibration": 1}', 'Partially correct: Gathering details helps, but never share OTPs even after verifying names.', 2),
    (s_urg, 'Share the OTP so I do not lose the job opportunity.', 'risky',
     '{"urgencySusceptibility": 3, "verificationHabit": -3, "trustCalibration": -2}', 'Risky: Sharing OTP can empty linked wallets or accounts within minutes.', 3),
    (s_urg, 'Share the OTP and also my Aadhaar number when they ask for full verification.', 'critical',
     '{"urgencySusceptibility": 3, "verificationHabit": -3, "trustCalibration": -3, "authoritySusceptibility": 2}', 'Critical: Combining OTP and Aadhaar enables identity and financial fraud.', 4);

  -- 5. SOCIAL (moderate) — Romance bait (extra pool depth)
  INSERT INTO scenarios (category, channel, title, description, voice_script, is_core, difficulty, tags, sort_order)
  VALUES (
    'social', 'social',
    'Online Romance Money Request',
    'Someone you matched with online last week messages: "I am stuck abroad and need 25,000 rupees for a ticket home. I will repay you next week. Please send to this UPI ID urgently." You have never met in person.',
    'Someone you matched with online last week messages saying they are stuck abroad and need 25,000 rupees for a ticket home. They promise to repay next week and ask you to send money to a UPI ID urgently. You have never met in person.',
    false, 2, ARRAY['social', 'romance', 'upi', 'urgency'], 15
  ) RETURNING id INTO s_social;

  INSERT INTO scenario_options (scenario_id, option_text, response_type, metric_impacts, explanation, sort_order) VALUES
    (s_social, 'Do not send money. End the conversation. Romance and emergency payment requests from online-only contacts are common scams.', 'safe',
     '{"trustCalibration": 3, "verificationHabit": 2, "urgencySusceptibility": -2, "digitalLiteracy": 2}', 'Correct: Never send money to people you have only met online.', 1),
    (s_social, 'Video call them and ask for travel documents before deciding.', 'cautious',
     '{"trustCalibration": 1, "verificationHabit": 1, "urgencySusceptibility": -1}', 'Partially correct: Extra checks help, but money requests from new online contacts remain high risk.', 2),
    (s_social, 'Send a smaller amount first to help, since they seem genuine.', 'risky',
     '{"trustCalibration": -2, "urgencySusceptibility": 2, "verificationHabit": -2}', 'Risky: Small payments are grooming for larger asks; you will rarely be repaid.', 3),
    (s_social, 'Send the full 25,000 rupees immediately so they do not miss the flight.', 'critical',
     '{"trustCalibration": -3, "urgencySusceptibility": 3, "verificationHabit": -3}', 'Critical: This is a classic romance scam pattern ending in financial loss.', 4);
END $$;
