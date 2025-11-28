const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const currentInput = userInput;
    setUserInput('');
    setIsProcessing(true);

    // Add user message to history
    const newHistory = [...conversationHistory, { role: 'user' as const, parts: [{ text: currentInput }] }];
    setConversationHistory(newHistory);

    // ========== CLIENT-SIDE VALIDATION ==========
    const isValid = isValidPassword(currentInput);

    let responseText = '';
    let isSuccess = false;

    if (isValid) {
        // ✅ SUCCESS - Valid password
        isSuccess = true;
        responseText = getSuccessMessage(mistakeCount);
    } else {
        // ❌ HERESY - Invalid password
        const newMistakeCount = mistakeCount + 1;
        setMistakeCount(newMistakeCount);
        setHeresyLevel(prev => Math.min(6, prev + 1));

        responseText = `I sense heresy... ${getHeresyMessage()}`;

        if (newMistakeCount >= 3) {
            responseText += " How about you join the community? Then tell me what the community name is.";
        }
    }

    try {
        // Still capture screen for spatial awareness context
        const screenImage = await captureScreen();

        // Update conversation history with our response
        setConversationHistory([...newHistory, { role: 'model', parts: [{ text: responseText }] }]);

        // Output to user
        speakAndType(responseText);

        if (isSuccess) {
            setTimeout(onSuccess, 3000); // Transition after success

        }

    } catch (error) {
        console.error("System Error:", error);
        // Fall back to local response even if capture fails
        setConversationHistory([...newHistory, { role: 'model', parts: [{ text: responseText }] }]);
        speakAndType(responseText);

        if (isSuccess) {
            setTimeout(onSuccess, 3000);
        }
    } finally {
        setIsProcessing(false);
    }
};
