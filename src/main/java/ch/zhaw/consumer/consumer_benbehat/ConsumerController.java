package ch.zhaw.consumer.consumer_benbehat;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
public class ConsumerController {
    @GetMapping("/ping")
        public String ping() {
            return "DJL Consumer app is up and running!";
    }


    @PostMapping(path = "/analyze")
    public String predict(@RequestParam("image") MultipartFile image) throws Exception {
        InputStream is = new ByteArrayInputStream(image.getBytes());
        var uri = "http://model-service:8080/predictions/traced_resnet18";
        var webClient = WebClient.create();
        Resource resource = new InputStreamResource(is);
        var result = webClient.post()
                        .uri(uri)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .body(BodyInserters.fromResource(resource))
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();
        return result;
    }
}
